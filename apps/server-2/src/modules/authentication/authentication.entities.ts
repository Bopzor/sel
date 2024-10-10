import { NotFoundError, UnauthorizedError } from 'src/infrastructure/http';
import { type schema } from 'src/persistence';

import { MemberEvent } from '../member/member.entities';

export enum TokenType {
  authentication = 'authentication',
  session = 'session',
}

export type Token = typeof schema.tokens.$inferSelect;
export type TokenInsert = typeof schema.tokens.$inferInsert;

export class AuthenticationLinkRequestedEvent extends MemberEvent {
  constructor(
    memberId: string,
    public readonly link: string,
  ) {
    super(memberId);
  }
}

export class MemberAuthenticatedEvent extends MemberEvent {}

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
