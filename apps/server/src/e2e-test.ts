import { expect } from 'vitest';

import { container } from './container';
import { StubConfigAdapter } from './infrastructure/config/stub-config.adapter';
import { TestMailSever } from './infrastructure/email/test-mail-server';
import { TestErrorReporterAdapter } from './infrastructure/error-reporter/test-error-reporter.adapter';
import { StubLogger } from './infrastructure/logger/stub-logger.adapter';
import { TOKENS } from './tokens';

export class E2ETest {
  config = new StubConfigAdapter({
    server: {
      host: 'localhost',
      port: 3030,
    },
    session: {
      secret: '',
      secure: false,
    },
    database: {
      url: process.env.DATABASE_URL ?? 'postgres://postgres@localhost/test',
    },
    app: {
      baseUrl: 'http://app.url',
    },
    email: {
      host: 'localhost',
      password: '',
      secure: false,
      port: 1125,
      sender: 'sel@localhost',
      templatesPath: 'email-templates',
    },
  });

  logger = new StubLogger();
  errorReporter = new TestErrorReporterAdapter();

  mailServer = new TestMailSever(this.config);

  private get server() {
    return container.resolve(TOKENS.server);
  }

  async setup() {
    container.bindValue(TOKENS.config, this.config);
    container.bindValue(TOKENS.logger, this.logger);
    container.bindValue(TOKENS.errorReporter, this.errorReporter);

    await container.resolve(TOKENS.database).reset();
    await container.resolve(TOKENS.emailRenderer).init?.();
    container.resolve(TOKENS.authenticationModule).init();

    await this.mailServer.listen();
    await this.server.start();
  }

  async teardown() {
    await this.server.close();
    await this.mailServer.close();
  }

  async fetch(path: string, options: { method?: string; token?: string; assertStatus?: boolean } = {}) {
    const { method = 'GET', token, assertStatus = true } = options;

    let response: Response | undefined = undefined;
    let body: unknown = undefined;

    try {
      const headers = new Headers();
      const init: RequestInit = { method, headers };

      if (token) {
        headers.set('Cookie', `token=${token}`);
      }

      response = await fetch(`http://localhost:3030${path}`, init);

      if (response.headers.get('Content-Type')?.startsWith('application/json')) {
        body = await response.clone().json();
      } else {
        body = await response.clone().text();
      }

      if (assertStatus) {
        expect(response.ok).toBe(true);
      }

      return { response, body };
    } catch (error) {
      if (body) {
        // eslint-disable-next-line no-console
        console.log(body);
      }

      throw error;
    }
  }
}
