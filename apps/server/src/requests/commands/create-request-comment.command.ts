import { injectableClass } from 'ditox';

import { CommentsService } from '../../comments/comments.service';
import { EventPublisherPort } from '../../infrastructure/events/event-publisher.port';
import { TOKENS } from '../../tokens';
import { RequestCommentCreated } from '../request-events';

export class CreateRequestComment {
  static inject = injectableClass(this, TOKENS.eventPublisher, TOKENS.commentsService);

  constructor(
    private readonly eventPublisher: EventPublisherPort,
    private readonly commentService: CommentsService
  ) {}

  async handle(commentId: string, requestId: string, authorId: string, text: string): Promise<void> {
    await this.commentService.createComment(commentId, 'request', requestId, authorId, text);

    this.eventPublisher.publish(new RequestCommentCreated(requestId, commentId));
  }
}
