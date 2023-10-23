export type ServerConfig = {
  host: string;
  port: number;
};

export type DatabaseConfig = {
  url: string;
};

export type EmailConfig = {
  host: string;
  port: number;
  sender: string;
  password: string;
};

export interface ConfigPort {
  server: ServerConfig;
  database: DatabaseConfig;
  email: EmailConfig;
}
