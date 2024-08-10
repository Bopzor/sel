import { DomainEvent } from '../domain-event';

export class TransactionEvent extends DomainEvent {
  entity = 'transaction';
}

export class TransactionCreated extends TransactionEvent {}
export class TransactionCompleted extends TransactionEvent {}
