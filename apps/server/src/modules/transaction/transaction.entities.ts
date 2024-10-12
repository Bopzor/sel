import { DomainEvent } from 'src/infrastructure/events';
import { schema } from 'src/persistence';

export type Transaction = typeof schema.transactions.$inferSelect;
export type TransactionInsert = typeof schema.transactions.$inferInsert;

export class TransactionCreatedEvent extends DomainEvent {}
export class TransactionPendingEvent extends DomainEvent {}
export class TransactionCompletedEvent extends DomainEvent {}
export class TransactionCanceledEvent extends DomainEvent {}
