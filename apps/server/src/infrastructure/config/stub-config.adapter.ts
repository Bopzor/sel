import { AppConfig, ConfigPort, DatabaseConfig, EmailConfig, ServerConfig } from './config.port';

export class StubConfigAdapter implements ConfigPort {
  server: ServerConfig;
  app: AppConfig;
  database: DatabaseConfig;
  email: EmailConfig;

  constructor(config: Partial<ConfigPort>) {
    this.server = {
      host: '',
      port: 0,
      sessionSecure: false,
      ...config.server,
    };

    this.app = {
      baseUrl: '',
      ...config.app,
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
      secure: false,
      templatesPath: '',
      ...config.email,
    };
  }
}
