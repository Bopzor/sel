import * as stream from 'node:stream';

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

export interface Storage {
  storeFile(name: string, buffer: Buffer, contentType: string): Promise<void>;
  getFile(name: string): Promise<stream.Readable>;
}

export class MinioStorage implements Storage {
  static inject = injectableClass(this, TOKENS.config);
  private minio: minio.Client;

  constructor(private config: Config) {
    this.minio = new minio.Client(config.minio);
  }

  async storeFile(name: string, buffer: Buffer, contentType: string): Promise<void> {
    await this.minio.putObject(this.config.minio.bucketName, name, buffer, buffer.byteLength, {
      'Content-Type': contentType,
    });
  }

  async getFile(name: string): Promise<stream.Readable> {
    try {
      return await this.minio.getObject(this.config.minio.bucketName, name);
    } catch (error) {
      if (error instanceof minio.S3Error && error.code === 'NoSuchKey') {
        throw new FileNotFound();
      }

      throw error;
    }
  }
}
