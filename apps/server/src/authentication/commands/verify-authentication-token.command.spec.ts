import { createDate } from '@sel/utils';
import { beforeEach, describe, expect, it } from 'vitest';

import { StubDate } from '../../infrastructure/date/stub-date.adapter';
import { StubEventPublisher } from '../../infrastructure/events/stub-event-publisher';
import { StubGenerator } from '../../infrastructure/generator/stub-generator.adapter';
import { MemberAuthenticated } from '../../members/member-events';
import { InMemoryTokenRepository } from '../../persistence/repositories/token/in-memory-token.repository';
import { UnitTest } from '../../unit-test';
import { AuthenticationService } from '../authentication.service';
import { createToken, TokenType } from '../token.entity';

import {
  VerifyAuthenticationToken,
  VerifyAuthenticationTokenCommand,
} from './verify-authentication-token.command';

class Test extends UnitTest {
  generator = new StubGenerator();
  dateAdapter = new StubDate();
  eventPublisher = new StubEventPublisher();
  tokenRepository = new InMemoryTokenRepository();

  authenticationService = new AuthenticationService(
    this.generator,
    this.dateAdapter,
    this.eventPublisher,
    this.tokenRepository,
  );

  handler = new VerifyAuthenticationToken(
    this.dateAdapter,
    this.eventPublisher,
    this.tokenRepository,
    this.authenticationService,
  );

  authToken = createToken({
    id: 'tokenId',
    value: 'authToken',
    expirationDate: createDate('2023-01-02'),
    memberId: 'memberId',
  });

  command: VerifyAuthenticationTokenCommand = {
    tokenValue: this.authToken.value,
    sessionTokenId: '',
  };

  setup() {
    this.generator.nextToken = '';
    this.dateAdapter.date = createDate('2023-01-01');
    this.tokenRepository.add(this.authToken);
  }

  async execute() {
    await this.handler.handle(this.command);
  }
}

describe('[Unit] VerifyAuthenticationToken', () => {
  let test: Test;

  beforeEach(() => {
    test = Test.create(Test);
  });

  it('creates a session token', async () => {
    test.generator.nextToken = 'sessionToken';
    test.dateAdapter.date = createDate('2023-01-01');

    test.command.tokenValue = 'authToken';
    test.command.sessionTokenId = 'sessionTokenId';
    await test.execute();

    const sessionToken = test.tokenRepository.get('sessionTokenId');

    expect(sessionToken).toHaveProperty('value', 'sessionToken');
    expect(sessionToken).toHaveProperty('expirationDate', createDate('2023-02-01'));
    expect(sessionToken).toHaveProperty('type', TokenType.session);
    expect(sessionToken).toHaveProperty('memberId', 'memberId');
  });

  it('revokes the authentication token', async () => {
    await test.execute();

    expect(test.tokenRepository.get('tokenId')).toHaveProperty('revoked', true);
  });

  it('triggers a AuthenticationLinkRequested domain event', async () => {
    await test.execute();

    expect(test.eventPublisher).toHaveEmitted(new MemberAuthenticated('memberId'));
  });

  it('throws when the authentication token does not exist', async () => {
    test.command.tokenValue = 'unknownToken';

    await expect(test.execute()).rejects.toThrow('Token not found');
  });

  it('throws when the authentication token is expired', async () => {
    test.dateAdapter.date = createDate('2023-01-03');

    await expect(test.execute()).rejects.toThrow('Token has expired');
  });
});
