import { DomainEvent } from '../domain-event';

import { CommentParentType } from './comment.entity';

export class CommentCreated extends DomainEvent {
  entity = 'comment';

  constructor(entityId: string, public readonly parentEntity: CommentParentType) {
    super(entityId);
  }
}
