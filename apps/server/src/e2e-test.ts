import { defined } from '@sel/utils';
import { expect } from 'vitest';

import { AuthenticationService } from './authentication/authentication.service';
import { Token, TokenType } from './authentication/token.entity';
import { container } from './container';
import { StubConfigAdapter } from './infrastructure/config/stub-config.adapter';
import { TestMailSever } from './infrastructure/email/test-mail-server';
import { TestErrorReporterAdapter } from './infrastructure/error-reporter/test-error-reporter.adapter';
import { StubLogger } from './infrastructure/logger/stub-logger.adapter';
import { Member } from './members/entities';
import { MembersRepository } from './members/members.repository';
import { MembersService } from './members/members.service';
import { Request } from './requests/request.entity';
import { RequestRepository } from './requests/request.repository';
import { RequestService } from './requests/request.service';
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

  create!: EntityCreator;

  async setup() {
    container.bindValue(TOKENS.config, this.config);
    container.bindValue(TOKENS.logger, this.logger);
    container.bindValue(TOKENS.errorReporter, this.errorReporter);

    await container.resolve(TOKENS.database).reset();
    await container.resolve(TOKENS.emailRenderer).init?.();
    container.resolve(TOKENS.authenticationModule).init();
    container.resolve(TOKENS.membersModule).init();
    container.resolve(TOKENS.requestModule).init();

    this.create = new EntityCreator(
      container.resolve(TOKENS.membersService),
      container.resolve(TOKENS.membersRepository),
      container.resolve(TOKENS.authenticationService),
      container.resolve(TOKENS.requestService),
      container.resolve(TOKENS.requestRepository)
    );

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
}

class EntityCreator {
  constructor(
    private readonly memberService: MembersService,
    private readonly memberRepository: MembersRepository,
    private readonly authenticationService: AuthenticationService,
    private readonly requestService: RequestService,
    private readonly requestRepository: RequestRepository
  ) {}

  // prettier-ignore
  async member({ firstName = '', lastName = '', email = '' }: { firstName?: string; lastName?: string; email?: string } = {}): Promise<Member> {
    const memberId = await this.memberService.createMember(firstName, lastName, email);
    return defined(await this.memberRepository.getMember(memberId));
  }

  async token(type: TokenType, memberId: string): Promise<Token> {
    return this.authenticationService.generateToken(type, memberId);
  }

  // prettier-ignore
  async request({requesterId = '', title = '', body = '' }: { requesterId?: string, title?: string, body?: string } = {}): Promise<Request> {
    const requestId = await this.requestService.createRequest(requesterId, title, body);
    return defined(await this.requestRepository.getRequest(requestId));
  }
}
