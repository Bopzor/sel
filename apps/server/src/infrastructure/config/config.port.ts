export type ServerConfig = {
  host: string;
  port: number;
};

export type DatabaseConfig = {
  url: string;
};

export interface ConfigPort {
  server: ServerConfig;
  database: DatabaseConfig;
}
