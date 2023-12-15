import { DomainEvent } from '../domain-event';

export class CommentCreatedEvent extends DomainEvent {
  entity = 'comment';
}
