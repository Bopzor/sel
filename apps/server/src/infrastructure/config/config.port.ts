export type ServerConfig = {
  host: string;
  port: number;
};

export type SessionConfig = {
  secure: boolean;
  secret: string;
};

export type AppConfig = {
  baseUrl: string;
};

export type DatabaseConfig = {
  url: string;
};

export type EmailConfig = {
  host: string;
  port: number;
  secure: boolean;
  sender: string;
  password: string;
};

export type SlackConfig = {
  webhookUrl: string;
};

export type PushConfig = {
  subject: string;
  publicKey: string;
  privateKey: string;
};

export interface ConfigPort {
  server: ServerConfig;
  session: SessionConfig;
  app: AppConfig;
  database: DatabaseConfig;
  email: EmailConfig;
  slack: SlackConfig;
  push: PushConfig;
}
