import { assert } from '@sel/utils';
import { injectableClass } from 'ditox';
import dotenv from 'dotenv';

import { AppConfig, ConfigPort, DatabaseConfig, EmailConfig, ServerConfig } from './config.port';

export class EnvConfigAdapter implements ConfigPort {
  static inject = injectableClass(this);

  server: ServerConfig;
  app: AppConfig;
  database: DatabaseConfig;
  email: EmailConfig;

  constructor() {
    dotenv.config();

    this.server = {
      host: this.get('HOST', String),
      port: this.get('PORT', parseInt),
      sessionSecure: this.get('SESSION_SECURE', this.parseBoolean),
    };

    this.app = {
      baseUrl: this.get('APP_BASE_URL', String),
    };

    this.database = {
      url: this.get('DB_URL', String),
    };

    this.email = {
      host: this.get('EMAIL_HOST', String),
      port: this.get('EMAIL_PORT', parseInt),
      secure: this.get('EMAIL_SECURE', this.parseBoolean),
      sender: this.get('EMAIL_FROM', String),
      password: this.get('EMAIL_PASSWORD', String),
      templatesPath: this.get('EMAIL_TEMPLATES', String),
    };
  }

  private get<T>(name: string, parse: (input: string) => T): T {
    const input = process.env[name];

    assert(input !== undefined, `Missing environment variable "${name}"`);

    return parse(input);
  }

  private parseBoolean(this: void, value: string) {
    assert(['true', 'false'].includes(value), 'Invalid boolean environment variable value');

    return value === 'true';
  }
}
