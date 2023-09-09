import { assert } from '@sel/utils';
import { injectableClass } from 'ditox';
import dotenv from 'dotenv';

import { ConfigPort, ServerConfig } from './config.port';

export class EnvConfigAdapter implements ConfigPort {
  static inject = injectableClass(this);

  server: ServerConfig;

  constructor() {
    dotenv.config();

    this.server = {
      host: this.get('HOST', String),
      port: this.get('PORT', parseInt),
    };
  }

  private get<T>(name: string, parse: (input: string) => T): T {
    const input = process.env[name];

    assert(input, `Missing environment variable "${name}"`);

    return parse(input);
  }
}
