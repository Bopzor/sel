import { InMemoryRepository } from '../in-memory.repository';

import { CommentsRepository } from './comments.repository';
import { Comment, CommentParentType } from './entities';

export class InMemoryCommentsRepository extends InMemoryRepository<Comment> implements CommentsRepository {
  getComment(): Promise<Comment | undefined> {
    throw new Error('Method not implemented.');
  }

  async insert(parentType: CommentParentType, parentId: string, comment: Comment): Promise<void> {
    this.add(comment);
  }
}
