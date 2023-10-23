import { ConfigPort, DatabaseConfig, EmailConfig, ServerConfig } from './config.port';

export class StubConfigAdapter implements ConfigPort {
  server: ServerConfig;
  database: DatabaseConfig;
  email: EmailConfig;

  constructor(config: Partial<ConfigPort>) {
    this.server = {
      host: '',
      port: 0,
      ...config.server,
    };

    this.database = {
      url: '',
      ...config.database,
    };

    this.email = {
      host: '',
      port: 0,
      sender: '',
      password: '',
      ...config.email,
    };
  }
}
