import { createDate } from '@sel/utils';
import { beforeEach, describe, expect, it } from 'vitest';

import { StubDate } from '../infrastructure/date/stub-date.adapter';
import { StubGenerator } from '../infrastructure/generator/stub-generator.adapter';

import { AuthenticationService } from './authentication.service';
import { InMemoryTokenRepository } from './in-memory-token.repository';
import { TokenType, createToken } from './token.entity';

describe('AuthenticationService', () => {
  let generator: StubGenerator;
  let dateAdapter: StubDate;
  let authenticationService: AuthenticationService;
  let tokenRepository: InMemoryTokenRepository;

  beforeEach(() => {
    generator = new StubGenerator();
    dateAdapter = new StubDate();
    tokenRepository = new InMemoryTokenRepository();
    authenticationService = new AuthenticationService(generator, dateAdapter, tokenRepository);
  });

  describe('generateToken', () => {
    beforeEach(() => {
      generator.idValue = 'generatedId';
      generator.tokenValue = 'generatedAuthToken';
      dateAdapter.date = new Date('2023-10-29T11:12:12.000Z');
    });

    it('generates an authentication token', async () => {
      const token = await authenticationService.generateToken(TokenType.authentication, 'memberId');

      expect(token).toHaveProperty('id', 'generatedId');
      expect(token).toHaveProperty('value', 'generatedAuthToken');
      expect(token).toHaveProperty('expirationDate', new Date('2023-10-29T12:12:12.000Z'));
      expect(token).toHaveProperty('type', TokenType.authentication);
      expect(token).toHaveProperty('memberId', 'memberId');
      expect(token).toHaveProperty('revoked', false);
    });

    it('persists the generated token', async () => {
      await authenticationService.generateToken(TokenType.authentication, 'memberId');

      expect(tokenRepository.get('generatedId')).toBeDefined();
    });
  });

  describe('verifyAuthenticationToken', () => {
    beforeEach(() => {
      tokenRepository.add(
        createToken({
          id: 'tokenId',
          value: 'authToken',
          expirationDate: createDate('2023-01-02'),
          memberId: 'memberId',
        })
      );

      dateAdapter.date = createDate('2023-01-01');
    });

    it('does not throw when the token is valid', async () => {
      await expect(authenticationService.verifyAuthenticationToken('authToken')).resolves.toEqual(
        expect.anything()
      );
    });

    it('returns a session token', async () => {
      generator.tokenValue = 'sessionToken';
      dateAdapter.date = createDate('2023-01-01');

      const sessionToken = await authenticationService.verifyAuthenticationToken('authToken');

      expect(sessionToken).toHaveProperty('value', 'sessionToken');
      expect(sessionToken).toHaveProperty('expirationDate', createDate('2023-02-01'));
      expect(sessionToken).toHaveProperty('type', TokenType.session);
      expect(sessionToken).toHaveProperty('memberId', 'memberId');
    });

    it('revokes the authentication token', async () => {
      await authenticationService.verifyAuthenticationToken('authToken');

      expect(tokenRepository.get('tokenId')).toHaveProperty('revoked', true);
    });

    it('throws when the authentication token does not exist', async () => {
      await expect(authenticationService.verifyAuthenticationToken('unknownToken')).rejects.toThrow(
        'token does not exist'
      );
    });

    it('throws when the authentication token is expired', async () => {
      dateAdapter.date = createDate('2023-01-03');

      await expect(authenticationService.verifyAuthenticationToken('authToken')).rejects.toThrow(
        'token has expired'
      );
    });
  });
});
