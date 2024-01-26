import { DomainEvent } from '../domain-event';

class SubscriptionEvent extends DomainEvent {
  entity = 'subscription';
}

export class SubscriptionCreated extends SubscriptionEvent {}
