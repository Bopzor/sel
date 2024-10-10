import { DomainEvent } from 'src/infrastructure/events';
import { schema } from 'src/persistence';

export type Transaction = typeof schema.transactions.$inferSelect;
export type TransactionInsert = typeof schema.transactions.$inferInsert;

export class TransactionCreated extends DomainEvent {}
export class TransactionPending extends DomainEvent {}
export class TransactionCompleted extends DomainEvent {}
export class TransactionCanceled extends DomainEvent {}
