import { InMemoryRepository } from '../in-memory.repository';

import { CommentsRepository } from './comments.repository';
import { Comment, CommentParentType } from './entities';

export class InMemoryCommentsRepository extends InMemoryRepository<Comment> implements CommentsRepository {
  async insert(parentType: CommentParentType, parentId: string, comment: Comment): Promise<void> {
    this.add(comment);
  }
}
