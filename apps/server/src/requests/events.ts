import { DomainEvent } from '../domain-event';

export class RequestCreated extends DomainEvent {
  entity = 'request';
}

export class RequestEdited extends DomainEvent {
  entity = 'request';
}
