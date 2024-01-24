import { describe, it, expect, beforeEach } from 'vitest';

import { StubConfigAdapter } from '../../infrastructure/config/stub-config.adapter';
import { StubDate } from '../../infrastructure/date/stub-date.adapter';
import { StubEventsAdapter } from '../../infrastructure/events/stub-events.adapter';
import { StubGenerator } from '../../infrastructure/generator/stub-generator.adapter';
import { createMember } from '../../members/entities';
import { AuthenticationLinkRequested } from '../../members/events';
import { InMemoryMemberRepository } from '../../persistence/repositories/member/in-memory-member.repository';
import { InMemoryTokenRepository } from '../../persistence/repositories/token/in-memory-token.repository';
import { UnitTest } from '../../unit-test';
import { AuthenticationService } from '../authentication.service';
import { createToken, TokenType } from '../token.entity';

import { RequestAuthenticationLink } from './request-authentication-link.command';

class Test extends UnitTest {
  config = new StubConfigAdapter({ app: { baseUrl: 'https://app.url' } });
  generator = new StubGenerator();
  dateAdapter = new StubDate();
  events = new StubEventsAdapter();
  tokenRepository = new InMemoryTokenRepository();
  memberRepository = new InMemoryMemberRepository();

  authenticationService = new AuthenticationService(
    this.generator,
    this.dateAdapter,
    this.events,
    this.tokenRepository
  );

  handler = new RequestAuthenticationLink(
    this.config,
    this.generator,
    this.events,
    this.memberRepository,
    this.tokenRepository,
    this.authenticationService
  );

  sessionToken = createToken({ value: 'session-token', memberId: 'memberId', type: TokenType.session });

  setup() {
    this.generator.nextId = 'generatedId';
    this.generator.nextToken = 'generatedAuthToken';
    this.dateAdapter.date = new Date('2023-10-29T11:12:12.000Z');
    this.tokenRepository.add(this.sessionToken);
  }
}

describe('[Unit] RequestAuthenticationLink', () => {
  let test: Test;

  beforeEach(() => {
    test = Test.create(Test);
  });

  it('triggers a AuthenticationLinkRequested domain event', async () => {
    test.generator.nextToken = 'authToken';
    test.memberRepository.add(createMember({ id: 'memberId', firstName: 'firstName', email: 'email' }));

    await test.handler.handle('email');

    expect(test.events).toHaveEmitted(
      new AuthenticationLinkRequested('memberId', 'https://app.url/?auth-token=authToken')
    );
  });

  it('does trigger the event when the member does not exist', async () => {
    await test.handler.handle('does-not-exist');

    expect(test.events.events).toHaveLength(0);
  });

  it('revokes the previous authentication token', async () => {
    test.memberRepository.add(createMember({ id: 'memberId', email: 'email' }));

    test.tokenRepository.add(
      createToken({ id: 'tokenId', memberId: 'memberId', type: TokenType.authentication, revoked: false })
    );

    await test.handler.handle('email');

    expect(test.tokenRepository.get('tokenId')).toHaveProperty('revoked', true);
  });
});
