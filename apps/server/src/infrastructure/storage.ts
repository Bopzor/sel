import { basename } from 'node:path';
import * as stream from 'node:stream';

import { assert, createObjectFromPath } from '@sel/utils';
import { injectableClass } from 'ditox';
import * as minio from 'minio';
import { ObjectInfo } from 'minio/dist/main/internal/type';
import { mergeDeep, setPath } from 'remeda';

import { TOKENS } from '../tokens';

import { Config } from './config';
import { NotFound } from './http';

class FileNotFound extends NotFound {
  constructor() {
    super('File not found');
  }
}

type Bucket = keyof Config['minio']['buckets'];

type Directory = {
  name: string;
  files: Array<File | Directory>;
};

type File = {
  name: string;
  size: number;
  updated: string;
};

type ObjectInfoTree = {
  [key: string]: ObjectInfo | ObjectInfoTree;
};

export interface Storage {
  listFiles(bucket: Bucket): Promise<Directory>;
  storeFile(bucket: Bucket, name: string, buffer: Buffer, contentType: string): Promise<void>;
  getFile(bucket: Bucket, name: string): Promise<stream.Readable>;
}

export class MinioStorage implements Storage {
  static inject = injectableClass(this, TOKENS.config);
  private minio: minio.Client;

  constructor(private config: Config) {
    this.minio = new minio.Client(config.minio);
  }

  async listFiles(bucket: Bucket): Promise<Directory> {
    const objects = await this.listBucketFiles(bucket);
    let root: object = {};

    for (const object of objects) {
      const path = object.name?.split('/') ?? [];

      root = mergeDeep(root, createObjectFromPath(path));
      root = setPath(root, path as [], object);
    }

    return this.createDirectory('.', root as ObjectInfoTree);
  }

  private listBucketFiles(bucket: string): Promise<ObjectInfo[]> {
    return new Promise<ObjectInfo[]>((resolve, reject) => {
      const stream = this.minio.listObjects(bucket, undefined, true);

      const data: ObjectInfo[] = [];

      stream.on('data', (info) => data.push(info));
      stream.on('end', () => resolve(data));
      stream.on('error', reject);
    });
  }

  private createDirectory(name: string, content: ObjectInfoTree): Directory {
    return {
      name,
      files: Object.entries(content).map(([name, content]): File | Directory => {
        if (this.isObjectInfo(content)) {
          return {
            name: basename(content.name!),
            size: content.size!,
            updated: new Date(content.lastModified!).toISOString(),
          };
        } else {
          return this.createDirectory(name, content);
        }
      }),
    };
  }

  private isObjectInfo(value: object): value is ObjectInfo {
    return 'size' in value && typeof value.size === 'number';
  }

  async storeFile(bucket: Bucket, name: string, buffer: Buffer, contentType: string): Promise<void> {
    await this.minio.putObject(this.config.minio.buckets[bucket], name, buffer, buffer.byteLength, {
      'Content-Type': contentType,
    });
  }

  async getFile(bucket: Bucket, name: string): Promise<stream.Readable> {
    try {
      return await this.minio.getObject(this.config.minio.buckets[bucket], name);
    } catch (error) {
      if (error instanceof minio.S3Error && error.code === 'NoSuchKey') {
        throw new FileNotFound();
      }

      throw error;
    }
  }
}

export class StubStorage implements Storage {
  private files = new Map<string, { contentType: string; content: Buffer }>();

  listFiles(): Promise<Directory> {
    throw new Error('Not implemented');
  }

  async storeFile(bucket: Bucket, name: string, buffer: Buffer, contentType: string): Promise<void> {
    this.files.set(name, { contentType, content: buffer });
  }

  async getFile(name: string): Promise<stream.Readable> {
    const buffer = this.files.get(name);

    assert(buffer);

    return stream.Readable.from(buffer.content);
  }
}
