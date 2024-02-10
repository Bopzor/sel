import { beforeEach, describe, expect, it } from 'vitest';

import { StubConfigAdapter } from '../../infrastructure/config/stub-config.adapter';
import { StubDate } from '../../infrastructure/date/stub-date.adapter';
import { StubEventPublisher } from '../../infrastructure/events/stub-event-publisher';
import { StubGenerator } from '../../infrastructure/generator/stub-generator.adapter';
import { AuthenticationLinkRequested } from '../../members/member-events';
import { createMember } from '../../members/member.entity';
import { InMemoryMemberRepository } from '../../persistence/repositories/member/in-memory-member.repository';
import { InMemoryTokenRepository } from '../../persistence/repositories/token/in-memory-token.repository';
import { UnitTest } from '../../unit-test';
import { AuthenticationService } from '../authentication.service';
import { createToken, TokenType } from '../token.entity';

import {
  RequestAuthenticationLink,
  RequestAuthenticationLinkCommand,
} from './request-authentication-link.command';

class Test extends UnitTest {
  config = new StubConfigAdapter({ app: { baseUrl: 'https://app.url' } });
  generator = new StubGenerator();
  dateAdapter = new StubDate();
  eventPublisher = new StubEventPublisher();
  tokenRepository = new InMemoryTokenRepository();
  memberRepository = new InMemoryMemberRepository();

  authenticationService = new AuthenticationService(
    this.generator,
    this.dateAdapter,
    this.eventPublisher,
    this.tokenRepository,
  );

  handler = new RequestAuthenticationLink(
    this.config,
    this.generator,
    this.eventPublisher,
    this.memberRepository,
    this.tokenRepository,
    this.authenticationService,
  );

  member = createMember({
    id: 'memberId',
    email: 'email',
  });

  command: RequestAuthenticationLinkCommand = {
    email: this.member.email,
  };

  setup() {
    this.generator.nextId = '';
    this.generator.nextToken = '';
    this.memberRepository.add(this.member);
  }

  async execute() {
    await this.handler.handle(this.command);
  }
}

describe('[Unit] RequestAuthenticationLink', () => {
  let test: Test;

  beforeEach(() => {
    test = Test.create(Test);
  });

  it('triggers a AuthenticationLinkRequested domain event', async () => {
    test.generator.nextId = 'authTokenId';
    test.generator.nextToken = 'authToken';

    test.command.email = 'email';
    await test.execute();

    expect(test.eventPublisher).toHaveEmitted(
      new AuthenticationLinkRequested('memberId', 'https://app.url/?auth-token=authToken'),
    );
  });

  it('does trigger the event when the member does not exist', async () => {
    test.command.email = 'does-not-exist';
    await test.execute();

    expect(test.eventPublisher.events).toHaveLength(0);
  });

  it('revokes the previous authentication token', async () => {
    test.tokenRepository.add(
      createToken({
        id: 'tokenId',
        memberId: 'memberId',
        type: TokenType.authentication,
        revoked: false,
      }),
    );

    await test.execute();

    expect(test.tokenRepository.get('tokenId')).toHaveProperty('revoked', true);
  });
});
