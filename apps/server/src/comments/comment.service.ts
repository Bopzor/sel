import { injectableClass } from 'ditox';

import { DatePort } from '../infrastructure/date/date.port';
import { EventPublisherPort } from '../infrastructure/events/event-publisher.port';
import { CommentRepository } from '../persistence/repositories/comment/comment.repository';
import { TOKENS } from '../tokens';

import { CommentCreated } from './comment-events';
import { Comment, CommentParentType } from './comment.entity';

export class CommentService {
  static inject = injectableClass(this, TOKENS.date, TOKENS.eventPublisher, TOKENS.commentRepository);

  constructor(
    private readonly dateAdapter: DatePort,
    private readonly eventPublisher: EventPublisherPort,
    private readonly commentsRepository: CommentRepository
  ) {}

  async createComment(
    commentId: string,
    entity: CommentParentType,
    entityId: string,
    authorId: string,
    text: string
  ): Promise<string> {
    const comment: Comment = {
      id: commentId,
      entityId,
      authorId,
      date: this.dateAdapter.now(),
      text,
    };

    await this.commentsRepository.insert(entity, entityId, comment);

    this.eventPublisher.publish(new CommentCreated(comment.id, entity));

    return commentId;
  }
}
