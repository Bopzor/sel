import { injectableClass } from 'ditox';

import { DatePort } from '../infrastructure/date/date.port';
import { EventsPort } from '../infrastructure/events/events.port';
import { GeneratorPort } from '../infrastructure/generator/generator.port';
import { TOKENS } from '../tokens';

import { CommentsRepository } from './comments.repository';
import { Comment, CommentParentType } from './entities';
import { CommentCreated } from './events';

export class CommentsService {
  static inject = injectableClass(
    this,
    TOKENS.generator,
    TOKENS.date,
    TOKENS.events,
    TOKENS.commentsRepository
  );

  constructor(
    private readonly generator: GeneratorPort,
    private readonly dateAdapter: DatePort,
    private readonly events: EventsPort,
    private readonly commentsRepository: CommentsRepository
  ) {}

  async createComment(
    entity: CommentParentType,
    entityId: string,
    authorId: string,
    body: string
  ): Promise<string> {
    const commentId = this.generator.id();

    const comment: Comment = {
      id: commentId,
      authorId,
      date: this.dateAdapter.now(),
      body,
    };

    await this.commentsRepository.insert(entity, entityId, comment);

    this.events.emit(new CommentCreated(comment.id, entity));

    return commentId;
  }
}
