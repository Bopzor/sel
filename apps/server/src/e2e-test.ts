import { expect } from 'vitest';

import { Token, TokenType, createToken } from './authentication/token.entity';
import { container } from './container';
import { StubConfigAdapter } from './infrastructure/config/stub-config.adapter';
import { TestMailSever } from './infrastructure/email/test-mail-server';
import { TestErrorReporterAdapter } from './infrastructure/error-reporter/test-error-reporter.adapter';
import { StubLogger } from './infrastructure/logger/stub-logger.adapter';
import { members, requests, tokens } from './infrastructure/persistence/schema';
import { Member } from './members/entities';
import { Request } from './requests/request.entity';
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

  persist = new Persistor();

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

  async fetch(
    path: string,
    options: { method?: string; token?: string; assertStatus?: boolean; body?: unknown } = {}
  ) {
    const { method = 'GET', token, assertStatus = true, body: requestBody } = options;

    let response: Response | undefined = undefined;
    let body: unknown = undefined;

    try {
      const headers = new Headers();
      const init: RequestInit = { method, headers };

      if (token) {
        headers.set('Cookie', `token=${token}`);
      }

      if (requestBody) {
        init.body = JSON.stringify(requestBody);
        headers.set('Content-Type', 'application/json');
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

  async persistAuthenticatedMember(member: Member, tokenValue: string) {
    const token = createToken({ memberId: member.id, value: tokenValue, type: TokenType.session });

    await this.persist.member(member);
    await this.persist.token(token);

    return [member, token.value] as const;
  }
}

class Persistor {
  private get db() {
    return container.resolve(TOKENS.database).db;
  }

  private get now() {
    return container.resolve(TOKENS.date).now();
  }

  async member(member: Member): Promise<Member> {
    await this.db.insert(members).values({
      ...member,
      createdAt: this.now,
      updatedAt: this.now,
    });

    return member;
  }

  async request(request: Request): Promise<Request> {
    await this.db.insert(requests).values({
      ...request,
      ...request.body,
      createdAt: this.now,
      updatedAt: this.now,
    });

    return request;
  }

  async token(token: Token): Promise<Token> {
    await this.db.insert(tokens).values({
      ...token,
      createdAt: this.now,
      updatedAt: this.now,
    });

    return token;
  }
}
