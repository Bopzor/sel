import {
  AppConfig,
  ConfigPort,
  DatabaseConfig,
  EmailConfig,
  PushConfig,
  ServerConfig,
  SessionConfig,
  SlackConfig,
} from './config.port';

export class StubConfigAdapter implements ConfigPort {
  server: ServerConfig;
  session: SessionConfig;
  app: AppConfig;
  database: DatabaseConfig;
  email: EmailConfig;
  slack: SlackConfig;
  push: PushConfig;

  constructor(config: Partial<ConfigPort>) {
    this.server = {
      host: '',
      port: 0,
      ...config.server,
    };

    this.session = {
      secret: '',
      secure: false,
      ...config.session,
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

    this.slack = {
      webhookUrl: '',
      ...config.slack,
    };

    this.push = {
      subject: '',
      privateKey: '',
      publicKey: '',
      ...config.push,
    };
  }
}
