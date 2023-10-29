import { container } from './container';
import { StubConfigAdapter } from './infrastructure/config/stub-config.adapter';
import { TestMailSever } from './infrastructure/email/test-mail-server';
import { TOKENS } from './tokens';

export class E2ETest {
  config = new StubConfigAdapter({
    server: {
      host: 'localhost',
      port: 3030,
      sessionSecure: false,
    },
    database: {
      url: 'postgres://postgres@localhost:5432/test',
    },
    app: {
      baseUrl: 'http://app.url',
    },
    email: {
      host: 'localhost',
      password: '',
      secure: false,
      port: 1025,
      sender: 'sel@localhost',
    },
  });

  mailServer = new TestMailSever(this.config);

  private get server() {
    return container.resolve(TOKENS.server);
  }

  async setup() {
    container.bindValue(TOKENS.config, this.config);

    await container.resolve(TOKENS.database).reset();
    await this.mailServer.listen();
  }

  async teardown() {
    await this.server.close();
    await this.mailServer.close();
  }

  async startServer() {
    await this.server.start();
  }
}
