import { createDate } from '@sel/utils';
import { beforeEach, describe, expect, it } from 'vitest';

import { StubConfigAdapter } from '../infrastructure/config/stub-config.adapter';
import { StubDate } from '../infrastructure/date/stub-date.adapter';
import { StubEventsAdapter } from '../infrastructure/events/stub-events.adapter';
import { StubGenerator } from '../infrastructure/generator/stub-generator.adapter';
import { createMember } from '../members/entities';
import { AuthenticationLinkRequested } from '../members/events';
import { StubMembersFacade } from '../members/members.facade';
import { UnitTest } from '../unit-test';

import { AuthenticationService } from './authentication.service';
import { InMemoryTokenRepository } from './in-memory-token.repository';
import { TokenType, createToken } from './token.entity';
class Test extends UnitTest {
  config = new StubConfigAdapter({ app: { baseUrl: 'https://app.url' } });
  generator = new StubGenerator();
  dateAdapter = new StubDate();
  events = new StubEventsAdapter();
  tokenRepository = new InMemoryTokenRepository();
  memberFacade = new StubMembersFacade();

  service = new AuthenticationService(
    this.config,
    this.generator,
    this.dateAdapter,
    this.events,
    this.tokenRepository,
    this.memberFacade
  );

  sessionToken = createToken({ value: 'session-token', memberId: 'memberId', type: TokenType.session });

  setup() {
    this.generator.idValue = 'generatedId';
    this.generator.tokenValue = 'generatedAuthToken';
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
      const token = await test.service.generateToken(TokenType.authentication, 'memberId');

      expect(token).toHaveProperty('id', 'generatedId');
      expect(token).toHaveProperty('value', 'generatedAuthToken');
      expect(token).toHaveProperty('expirationDate', new Date('2023-10-29T12:12:12.000Z'));
      expect(token).toHaveProperty('type', TokenType.authentication);
      expect(token).toHaveProperty('memberId', 'memberId');
      expect(token).toHaveProperty('revoked', false);
    });

    it('persists the generated token', async () => {
      await test.service.generateToken(TokenType.authentication, 'memberId');

      expect(test.tokenRepository.get('generatedId')).toBeDefined();
    });
  });

  describe('requestAuthenticationLink', () => {
    it('triggers a domain event to sends an authentication link by email', async () => {
      test.generator.tokenValue = 'authToken';
      test.memberFacade.members.push(
        createMember({ id: 'memberId', firstName: 'firstName', email: 'email' })
      );

      await test.service.requestAuthenticationLink('email');

      expect(test.events.events).toContainEqual(
        new AuthenticationLinkRequested('memberId', 'https://app.url/?auth-token=authToken')
      );
    });

    it('does trigger the event when the member does not exist', async () => {
      await test.service.requestAuthenticationLink('does-not-exist');

      expect(test.events.events).toHaveLength(0);
    });

    it('revokes the previous authentication token', async () => {
      test.memberFacade.members.push(createMember({ id: 'memberId', email: 'email' }));

      test.tokenRepository.add(
        createToken({ id: 'tokenId', memberId: 'memberId', type: TokenType.authentication, revoked: false })
      );

      await test.service.requestAuthenticationLink('email');

      expect(test.tokenRepository.get('tokenId')).toHaveProperty('revoked', true);
    });
  });

  describe('verifyAuthenticationToken', () => {
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
      await expect(test.service.verifyAuthenticationToken('authToken')).resolves.toEqual(expect.anything());
    });

    it('returns a session token', async () => {
      test.generator.tokenValue = 'sessionToken';
      test.dateAdapter.date = createDate('2023-01-01');

      const sessionToken = await test.service.verifyAuthenticationToken('authToken');

      expect(sessionToken).toHaveProperty('value', 'sessionToken');
      expect(sessionToken).toHaveProperty('expirationDate', createDate('2023-02-01'));
      expect(sessionToken).toHaveProperty('type', TokenType.session);
      expect(sessionToken).toHaveProperty('memberId', 'memberId');
    });

    it('revokes the authentication token', async () => {
      await test.service.verifyAuthenticationToken('authToken');

      expect(test.tokenRepository.get('tokenId')).toHaveProperty('revoked', true);
    });

    it('throws when the authentication token does not exist', async () => {
      await expect(test.service.verifyAuthenticationToken('unknownToken')).rejects.toThrow(
        'token does not exist'
      );
    });

    it('throws when the authentication token is expired', async () => {
      test.dateAdapter.date = createDate('2023-01-03');

      await expect(test.service.verifyAuthenticationToken('authToken')).rejects.toThrow('token has expired');
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
