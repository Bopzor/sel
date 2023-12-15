import { DatePort } from '../infrastructure/date/date.port';
import { EventsPort } from '../infrastructure/events/events.port';
import { GeneratorPort } from '../infrastructure/generator/generator.port';

import { CommentsRepository } from './comments.repository';
import { Comment, CommentParentType } from './entities';
import { CommentCreatedEvent } from './events';

export class CommentsService {
  constructor(
    private readonly generator: GeneratorPort,
    private readonly dateAdapter: DatePort,
    private readonly events: EventsPort,
    private readonly commentsRepository: CommentsRepository
  ) {}

  async createComment(entity: CommentParentType, entityId: string, authorId: string, body: string) {
    const comment: Comment = {
      id: this.generator.id(),
      authorId,
      date: this.dateAdapter.now(),
      body,
    };

    await this.commentsRepository.insert(entity, entityId, comment);

    this.events.emit(new CommentCreatedEvent(comment.id));
  }
}
