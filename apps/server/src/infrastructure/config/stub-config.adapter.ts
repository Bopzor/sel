import { ConfigPort, ServerConfig } from './config.port';

export class StubConfigAdapter implements ConfigPort {
  server: ServerConfig;

  constructor(config: Partial<ConfigPort>) {
    this.server = {
      host: '',
      port: 0,
      ...config.server,
    };
  }
}
