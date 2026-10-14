import { basename } from 'node:path';
import { Readable } from 'stream';

import {
  GetObjectCommand,
  ListObjectsV2Command,
  NoSuchKey,
  PutObjectCommand,
  S3Client,
  _Object as S3Object,
} from '@aws-sdk/client-s3';
import { assert, createObjectFromPath } from '@sel/utils';
import { injectableClass } from 'ditox';
import * as minio from 'minio';
import { mergeDeep, setPath } from 'remeda';

import { TOKENS } from '../tokens';

import { Config } from './config';
import { NotFound } from './http';

type ObjectInfo = {
  name?: string;
  lastModified?: Date;
  size?: number;
};

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
  getFile(bucket: Bucket, name: string): Promise<Readable>;
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

  private listBucketFiles(bucket: Bucket): Promise<ObjectInfo[]> {
    return new Promise<ObjectInfo[]>((resolve, reject) => {
      const stream = this.minio.listObjects(this.config.minio.buckets[bucket], undefined, true);

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

  async getFile(bucket: Bucket, name: string): Promise<Readable> {
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

type S3ObjectTree = {
  [key: string]: S3Object | S3ObjectTree;
};

export class S3Storage implements Storage {
  static inject = injectableClass(this, TOKENS.config);
  private s3: S3Client;

  constructor(private config: Config) {
    const protocol = config.s3.useSSL ? 'https' : 'http';
    const endpoint = `${protocol}://${config.s3.endPoint}:${config.s3.port}`;

    this.s3 = new S3Client({
      endpoint,
      region: 'us-east-1',
      credentials: {
        accessKeyId: config.s3.accessKey,
        secretAccessKey: config.s3.secretKey,
      },
      forcePathStyle: true,
    });
  }

  async listFiles(bucket: Bucket): Promise<Directory> {
    const objects = await this.listBucketFiles(this.config.s3.buckets[bucket]);
    let root: object = {};

    for (const object of objects) {
      const path = object.Key?.split('/') ?? [];

      root = mergeDeep(root, createObjectFromPath(path));
      root = setPath(root, path as [], object);
    }

    return this.createDirectory('.', root as S3ObjectTree);
  }

  private async listBucketFiles(bucket: string): Promise<S3Object[]> {
    const data: S3Object[] = [];
    let continuationToken: string | undefined;

    do {
      const response = await this.s3.send(
        new ListObjectsV2Command({
          Bucket: bucket,
          ContinuationToken: continuationToken,
        }),
      );

      data.push(...(response.Contents ?? []));
      continuationToken = response.NextContinuationToken;
    } while (continuationToken);

    return data;
  }

  private createDirectory(name: string, content: S3ObjectTree): Directory {
    return {
      name,
      files: Object.entries(content)
        .filter(([name]) => name !== '')
        .map(([name, content]): File | Directory => {
          if (this.isS3Object(content)) {
            return {
              name: basename(content.Key!),
              size: content.Size!,
              updated: new Date(content.LastModified!).toISOString(),
            };
          } else {
            return this.createDirectory(name, content);
          }
        }),
    };
  }

  private isS3Object(value: object): value is S3Object {
    return 'Size' in value && typeof value.Size === 'number';
  }

  async storeFile(bucket: Bucket, name: string, buffer: Buffer, contentType: string): Promise<void> {
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.config.s3.buckets[bucket],
        Key: name,
        Body: buffer,
        ContentType: contentType,
        ContentLength: buffer.byteLength,
      }),
    );
  }

  async getFile(bucket: Bucket, name: string): Promise<Readable> {
    try {
      const response = await this.s3.send(
        new GetObjectCommand({
          Bucket: this.config.s3.buckets[bucket],
          Key: name,
        }),
      );

      return response.Body as Readable;
    } catch (error) {
      if (error instanceof NoSuchKey) {
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

  async getFile(name: string): Promise<Readable> {
    const buffer = this.files.get(name);

    assert(buffer);

    return Readable.from(buffer.content);
  }
}
