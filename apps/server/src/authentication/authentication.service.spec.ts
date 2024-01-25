import { beforeEach, describe, expect, it } from 'vitest';

import { StubDate } from '../infrastructure/date/stub-date.adapter';
import { StubEventPublisher } from '../infrastructure/events/stub-event-publisher';
import { StubGenerator } from '../infrastructure/generator/stub-generator.adapter';
import { InMemoryTokenRepository } from '../persistence/repositories/token/in-memory-token.repository';
import { UnitTest } from '../unit-test';

import { AuthenticationService } from './authentication.service';
import { TokenType, createToken } from './token.entity';

class Test extends UnitTest {
  generator = new StubGenerator();
  dateAdapter = new StubDate();
  eventPublisher = new StubEventPublisher();
  tokenRepository = new InMemoryTokenRepository();

  service = new AuthenticationService(
    this.generator,
    this.dateAdapter,
    this.eventPublisher,
    this.tokenRepository
  );

  sessionToken = createToken({ value: 'session-token', memberId: 'memberId', type: TokenType.session });

  setup() {
    this.generator.nextId = 'generatedId';
    this.generator.nextToken = 'generatedAuthToken';
    this.dateAdapter.date = new Date('2023-10-29T11:12:12.000Z');
    this.tokenRepository.add(this.sessionToken);
  }
}

describe('[Unit] AuthenticationService', () => {
  let test: Test;

  beforeEach(() => {
    test = Test.create(Test);
  });

  describe('generateToken', () => {
    it('generates an authentication token', async () => {
      const token = await test.service.generateToken(TokenType.authentication, 'tokenId', 'memberId');

      expect(token).toHaveProperty('id', 'tokenId');
      expect(token).toHaveProperty('value', 'generatedAuthToken');
      expect(token).toHaveProperty('expirationDate', new Date('2023-10-29T12:12:12.000Z'));
      expect(token).toHaveProperty('type', TokenType.authentication);
      expect(token).toHaveProperty('memberId', 'memberId');
      expect(token).toHaveProperty('revoked', false);
    });

    it('persists the generated token', async () => {
      await test.service.generateToken(TokenType.authentication, 'tokenId', 'memberId');

      expect(test.tokenRepository.get('tokenId')).toBeDefined();
    });
  });

  describe('getMemberIdFromToken', () => {
    it("retrieves a member's id from a token", async () => {
      const result = test.service.getMemberIdFromToken('session-token');

      await expect(result).resolves.toEqual('memberId');
    });

    it("retrieves a member's id from a token of an expected type", async () => {
      const result = test.service.getMemberIdFromToken('session-token', TokenType.session);

      await expect(result).resolves.toEqual('memberId');
    });

    it('resolves with undefined when the token is not of the expected type', async () => {
      const result = test.service.getMemberIdFromToken('session-token', TokenType.authentication);

      await expect(result).resolves.toBeUndefined();
    });

    it('resolves with undefined when the token does not exist', async () => {
      const result = test.service.getMemberIdFromToken('unknown-token');

      await expect(result).resolves.toBeUndefined();
    });
  });
});
