export type ServerConfig = {
  host: string;
  port: number;
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

export interface ConfigPort {
  server: ServerConfig;
  app: AppConfig;
  database: DatabaseConfig;
  email: EmailConfig;
}
