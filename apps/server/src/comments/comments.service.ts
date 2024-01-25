import { injectableClass } from 'ditox';

import { DatePort } from '../infrastructure/date/date.port';
import { EventsPort } from '../infrastructure/events/events.port';
import { CommentRepository } from '../persistence/repositories/comment/comment.repository';
import { TOKENS } from '../tokens';

import { Comment, CommentParentType } from './entities';
import { CommentCreated } from './events';

export class CommentsService {
  static inject = injectableClass(this, TOKENS.date, TOKENS.events, TOKENS.commentRepository);

  constructor(
    private readonly dateAdapter: DatePort,
    private readonly events: EventsPort,
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

    this.events.emit(new CommentCreated(comment.id, entity));

    return commentId;
  }
}
