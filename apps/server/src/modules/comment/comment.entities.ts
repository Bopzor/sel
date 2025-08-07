import { DomainEvent } from 'src/infrastructure/events';
import { schema } from 'src/persistence';

export type Comment = typeof schema.comments.$inferSelect;

export type CommentEntityType = 'request' | 'event' | 'information';
export class CommentCreatedEvent extends DomainEvent<{
  type: CommentEntityType;
  entityId: string;
  authorId: string;
}> {}
