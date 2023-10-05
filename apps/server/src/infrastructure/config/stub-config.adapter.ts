import { ConfigPort, DatabaseConfig, ServerConfig } from './config.port';

export class StubConfigAdapter implements ConfigPort {
  server: ServerConfig;
  database: DatabaseConfig;

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
  }
}
