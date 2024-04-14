import { Comment, CommentParentType } from '../../../comments/comment.entity';
import { InMemoryRepository } from '../../../in-memory.repository';

import { CommentRepository } from './comment.repository';

export class InMemoryCommentRepository extends InMemoryRepository<Comment> implements CommentRepository {
  async getComment(commentId: string): Promise<Comment | undefined> {
    return this.get(commentId);
  }

  async insert(parentType: CommentParentType, parentId: string, comment: Comment): Promise<void> {
    this.add(comment);
  }
}
