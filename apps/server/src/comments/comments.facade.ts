import { injectableClass } from 'ditox';

import { TOKENS } from '../tokens';

import { CommentsService } from './comments.service';
import { CommentParentType } from './entities';

export interface CommentsFacade {
  createComment(entity: CommentParentType, entityId: string, authorId: string, body: string): Promise<string>;
}

export class CommentsFacadeImpl implements CommentsFacade {
  static inject = injectableClass(this, TOKENS.commentsService);

  constructor(private readonly commentsService: CommentsService) {}

  async createComment(
    entity: CommentParentType,
    entityId: string,
    authorId: string,
    body: string
  ): Promise<string> {
    return this.commentsService.createComment(entity, entityId, authorId, body);
  }
}
