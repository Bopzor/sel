import { basename } from 'node:path';
import * as stream from 'node:stream';
import type { Readable } from 'stream';

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  NoSuchKey,
  _Object as S3Object,
  NoSuchBucket,
} from '@aws-sdk/client-s3';
import { assert, createObjectFromPath } from '@sel/utils';
import { injectableClass } from 'ditox';
import { mergeDeep, setPath } from 'remeda';

import { TOKENS } from '../tokens';

import { Config } from './config';
import { NotFound } from './http';

class FileNotFound extends NotFound {
  constructor() {
    super('File not found');
  }
}

type Bucket = keyof Config['s3']['buckets'];

type Directory = {
  name: string;
  files: Array<File | Directory>;
};

type File = {
  name: string;
  size: number;
  updated: string;
};

type S3ObjectTree = {
  [key: string]: S3Object | S3ObjectTree;
};

export interface Storage {
  listFiles(bucket: Bucket): Promise<Directory>;
  storeFile(bucket: Bucket, name: string, buffer: Buffer, contentType: string): Promise<void>;
  getFile(bucket: Bucket, name: string): Promise<stream.Readable>;
}

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
    return 'Size' in value && Boolean(value.Size);
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
      if (error instanceof NoSuchKey || error instanceof NoSuchBucket) {
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
