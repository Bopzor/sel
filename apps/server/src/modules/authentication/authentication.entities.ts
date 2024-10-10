import { DomainEvent } from 'src/infrastructure/events';
import { type schema } from 'src/persistence';

export enum TokenType {
  authentication = 'authentication',
  session = 'session',
}

export type Token = typeof schema.tokens.$inferSelect;
export type TokenInsert = typeof schema.tokens.$inferInsert;

export class AuthenticationLinkRequestedEvent extends DomainEvent<{ link: string }> {}

export class MemberAuthenticatedEvent extends DomainEvent {}
