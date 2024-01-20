import { injectableClass } from 'ditox';

import { TOKENS } from '../tokens';

import { CommentsRepository } from './comments.repository';
import { CommentsService } from './comments.service';
import { Comment, CommentParentType } from './entities';

export interface CommentsFacade {
  getComment(commentId: string): Promise<Comment | undefined>;
  createComment(entity: CommentParentType, entityId: string, authorId: string, text: string): Promise<string>;
}

export class StubCommentsFacade implements CommentsFacade {
  getComment(): Promise<Comment | undefined> {
    throw new Error('Method not implemented.');
  }

  createComment(): Promise<string> {
    throw new Error('Method not implemented.');
  }
}

export class CommentsFacadeImpl implements CommentsFacade {
  static inject = injectableClass(this, TOKENS.commentsService, TOKENS.commentsRepository);

  constructor(
    private readonly commentsService: CommentsService,
    private readonly commentsRepository: CommentsRepository
  ) {}

  async getComment(commentId: string): Promise<Comment | undefined> {
    return this.commentsRepository.getComment(commentId);
  }

  async createComment(
    entity: CommentParentType,
    entityId: string,
    authorId: string,
    text: string
  ): Promise<string> {
    return this.commentsService.createComment(entity, entityId, authorId, text);
  }
}
