import * as stream from 'node:stream';

import { assert } from '@sel/utils';
import { injectableClass } from 'ditox';
import * as minio from 'minio';

import { TOKENS } from '../tokens';

import { Config } from './config';
import { NotFound } from './http';

class FileNotFound extends NotFound {
  constructor() {
    super('File not found');
  }
}

type Bucket = keyof Config['minio']['buckets'];

export interface Storage {
  storeFile(bucket: Bucket, name: string, buffer: Buffer, contentType: string): Promise<void>;
  getFile(bucket: Bucket, name: string): Promise<stream.Readable>;
}

export class MinioStorage implements Storage {
  static inject = injectableClass(this, TOKENS.config);
  private minio: minio.Client;

  constructor(private config: Config) {
    this.minio = new minio.Client(config.minio);
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

  async storeFile(bucket: Bucket, name: string, buffer: Buffer, contentType: string): Promise<void> {
    this.files.set(name, { contentType, content: buffer });
  }

  async getFile(name: string): Promise<stream.Readable> {
    const buffer = this.files.get(name);

    assert(buffer);

    return stream.Readable.from(buffer.content);
  }
}
