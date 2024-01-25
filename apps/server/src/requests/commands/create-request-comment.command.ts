import { injectableClass } from 'ditox';

import { CommentService } from '../../comments/comment.service';
import { EventPublisherPort } from '../../infrastructure/events/event-publisher.port';
import { TOKENS } from '../../tokens';
import { RequestCommentCreated } from '../request-events';

export type CreateRequestCommentCommand = {
  commentId: string;
  requestId: string;
  authorId: string;
  text: string;
};

export class CreateRequestComment {
  static inject = injectableClass(this, TOKENS.eventPublisher, TOKENS.commentService);

  constructor(
    private readonly eventPublisher: EventPublisherPort,
    private readonly commentService: CommentService
  ) {}

  async handle({ commentId, requestId, authorId, text }: CreateRequestCommentCommand): Promise<void> {
    await this.commentService.createComment(commentId, 'request', requestId, authorId, text);

    this.eventPublisher.publish(new RequestCommentCreated(requestId, commentId));
  }
}
