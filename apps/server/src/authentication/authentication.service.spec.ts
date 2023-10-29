import { describe, expect, it } from 'vitest';

import { StubDate } from '../infrastructure/date/stub-date.adapter';
import { StubGenerator } from '../infrastructure/generator/stub-generator.adapter';

import { AuthenticationService } from './authentication.service';

describe('AuthenticationService', () => {
  describe('generateToken', () => {
    it('generates an authentication token', () => {
      const generator = new StubGenerator();
      const dateAdapter = new StubDate();
      const authenticationService = new AuthenticationService(generator, dateAdapter);

      generator.tokenValue = 'generatedAuthToken';
      dateAdapter.date = new Date('2023-10-29T11:12:12.000Z');

      const token = authenticationService.generateToken('authentication');

      expect(token).toHaveProperty('value', 'generatedAuthToken');
      expect(token).toHaveProperty('expirationDate', new Date('2023-10-29T12:12:12.000Z'));
      expect(token).toHaveProperty('type', 'authentication');
    });
  });
});
