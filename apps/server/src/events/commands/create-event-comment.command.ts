import { injectableClass } from 'ditox';

import { CommentService } from '../../comments/comment.service';
import { CommandHandler } from '../../infrastructure/cqs/command-handler';
import { EventPublisherPort } from '../../infrastructure/events/event-publisher.port';
import { TOKENS } from '../../tokens';
import { EventCommentCreated } from '../event-events';

export type CreateEventCommentCommand = {
  commentId: string;
  eventId: string;
  authorId: string;
  text: string;
};

export class CreateEventComment implements CommandHandler<CreateEventCommentCommand> {
  static inject = injectableClass(this, TOKENS.eventPublisher, TOKENS.commentService);

  constructor(
    private readonly eventPublisher: EventPublisherPort,
    private readonly commentService: CommentService,
  ) {}

  async handle({ commentId, eventId, authorId, text }: CreateEventCommentCommand): Promise<void> {
    await this.commentService.createComment(commentId, 'event', eventId, authorId, text);

    this.eventPublisher.publish(new EventCommentCreated(eventId, commentId, authorId));
  }
}
