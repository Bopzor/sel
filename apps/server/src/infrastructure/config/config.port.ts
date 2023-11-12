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
  templatesPath: string;
};

export interface ConfigPort {
  server: ServerConfig;
  session: SessionConfig;
  app: AppConfig;
  database: DatabaseConfig;
  email: EmailConfig;
}
