import { assert } from '@sel/utils';
import { injectableClass } from 'ditox';
import dotenv from 'dotenv';

import { ConfigPort, DatabaseConfig, ServerConfig } from './config.port';

export class EnvConfigAdapter implements ConfigPort {
  static inject = injectableClass(this);

  server: ServerConfig;
  database: DatabaseConfig;

  constructor() {
    dotenv.config();

    this.server = {
      host: this.get('HOST', String),
      port: this.get('PORT', parseInt),
    };

    this.database = {
      url: this.get('DB_URL', String),
    };
  }

  private get<T>(name: string, parse: (input: string) => T): T {
    const input = process.env[name];

    assert(input, `Missing environment variable "${name}"`);

    return parse(input);
  }
}
