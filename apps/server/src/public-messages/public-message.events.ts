import { DomainEvent } from '../domain-event';

export class PublicMessageEvent extends DomainEvent {
  entity = 'publicMessage';
}

export class PublicMessagePublished extends PublicMessageEvent {}
