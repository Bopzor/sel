import { DomainEvent } from 'src/infrastructure/events';
import { NotFoundError, UnauthorizedError } from 'src/infrastructure/http';
import { type schema } from 'src/persistence';

export enum TokenType {
  authentication = 'authentication',
  session = 'session',
}

export type Token = typeof schema.tokens.$inferSelect;
export type TokenInsert = typeof schema.tokens.$inferInsert;

export class AuthenticationLinkRequestedEvent extends DomainEvent<{ link: string }> {}

export class MemberAuthenticatedEvent extends DomainEvent {}

export class InvalidSessionTokenError extends UnauthorizedError {
  constructor() {
    super('Invalid session token');
  }
}

export class TokenNotFoundError extends NotFoundError {
  constructor() {
    super('Token does not exist');
  }
}

export class TokenExpiredError extends UnauthorizedError {
  constructor() {
    super('Token has expired');
  }
}
