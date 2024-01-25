import { DomainError } from '../domain-error';

export class TokenNotFound extends DomainError<{ tokenValue: string }> {
  constructor(tokenValue: string) {
    super('Token not found', { tokenValue });
  }
}

export class TokenExpired extends DomainError<{ tokenValue: string }> {
  constructor(tokenValue: string) {
    super('Token has expired', { tokenValue });
  }
}

export class AuthenticationError extends Error {
  constructor() {
    super('request must me authenticated');
  }
}

export class InvalidSessionTokenError extends Error {
  constructor() {
    super('invalid session token');
  }
}
