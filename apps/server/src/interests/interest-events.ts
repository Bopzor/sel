import { DomainEvent } from '../domain-event';

export class InterestEvent extends DomainEvent {
  entity = 'interest';
}

export class InterestCreated extends InterestEvent {}
