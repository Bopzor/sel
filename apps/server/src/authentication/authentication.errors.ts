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
