import { DomainEvent } from '../domain-event';

export class CommentCreated extends DomainEvent {
  entity = 'comment';
}
