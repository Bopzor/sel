import { Comment, CommentParentType } from '../../../comments/entities';
import { InMemoryRepository } from '../../../in-memory.repository';

import { CommentRepository } from './comment.repository';

export class InMemoryCommentRepository extends InMemoryRepository<Comment> implements CommentRepository {
  getComment(): Promise<Comment | undefined> {
    throw new Error('Method not implemented.');
  }

  async insert(parentType: CommentParentType, parentId: string, comment: Comment): Promise<void> {
    this.add(comment);
  }
}
