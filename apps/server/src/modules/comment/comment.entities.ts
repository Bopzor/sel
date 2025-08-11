import * as shared from '@sel/shared';

import { DomainEvent } from 'src/infrastructure/events';
import { schema } from 'src/persistence';

export type Comment = typeof schema.comments.$inferSelect;

export class CommentCreatedEvent extends DomainEvent<{
  entityType: shared.CommentEntityType;
  entityId: string;
  commentAuthorId: string;
}> {}
