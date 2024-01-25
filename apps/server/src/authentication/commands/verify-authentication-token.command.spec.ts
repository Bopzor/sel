import { createDate } from '@sel/utils';
import { beforeEach, describe, expect, it } from 'vitest';

import { StubDate } from '../../infrastructure/date/stub-date.adapter';
import { StubEventPublisher } from '../../infrastructure/events/stub-event-publisher';
import { StubGenerator } from '../../infrastructure/generator/stub-generator.adapter';
import { MemberAuthenticated } from '../../members/events';
import { InMemoryTokenRepository } from '../../persistence/repositories/token/in-memory-token.repository';
import { UnitTest } from '../../unit-test';
import { AuthenticationService } from '../authentication.service';
import { createToken, TokenType } from '../token.entity';

import { VerifyAuthenticationToken } from './verify-authentication-token.command';

class Test extends UnitTest {
  generator = new StubGenerator();
  dateAdapter = new StubDate();
  eventPublisher = new StubEventPublisher();
  tokenRepository = new InMemoryTokenRepository();

  authenticationService = new AuthenticationService(
    this.generator,
    this.dateAdapter,
    this.eventPublisher,
    this.tokenRepository
  );

  handler = new VerifyAuthenticationToken(
    this.dateAdapter,
    this.eventPublisher,
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

describe('[Unit] VerifyAuthenticationToken', () => {
  let test: Test;

  beforeEach(() => {
    test = Test.create(Test);
  });

  beforeEach(() => {
    test.tokenRepository.add(
      createToken({
        id: 'tokenId',
        value: 'authToken',
        expirationDate: createDate('2023-01-02'),
        memberId: 'memberId',
      })
    );

    test.dateAdapter.date = createDate('2023-01-01');
  });

  it('does not throw when the token is valid', async () => {
    await expect(test.handler.handle('authToken', '')).resolves.toBeUndefined();
  });

  it('creates a session token', async () => {
    test.generator.nextToken = 'sessionToken';
    test.dateAdapter.date = createDate('2023-01-01');

    await test.handler.handle('authToken', 'sessionTokenId');

    const sessionToken = test.tokenRepository.get('sessionTokenId');

    expect(sessionToken).toHaveProperty('value', 'sessionToken');
    expect(sessionToken).toHaveProperty('expirationDate', createDate('2023-02-01'));
    expect(sessionToken).toHaveProperty('type', TokenType.session);
    expect(sessionToken).toHaveProperty('memberId', 'memberId');
  });

  it('revokes the authentication token', async () => {
    await test.handler.handle('authToken', '');

    expect(test.tokenRepository.get('tokenId')).toHaveProperty('revoked', true);
  });

  it('triggers a AuthenticationLinkRequested domain event', async () => {
    await test.handler.handle('authToken', '');

    expect(test.eventPublisher).toHaveEmitted(new MemberAuthenticated('memberId'));
  });

  it('throws when the authentication token does not exist', async () => {
    await expect(test.handler.handle('unknownToken', '')).rejects.toThrow('Token not found');
  });

  it('throws when the authentication token is expired', async () => {
    test.dateAdapter.date = createDate('2023-01-03');

    await expect(test.handler.handle('authToken', '')).rejects.toThrow('Token has expired');
  });
});
