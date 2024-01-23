import { Comment, CommentParentType } from '../../../comments/entities';

export interface CommentRepository {
  getComment(commentId: string): Promise<Comment | undefined>;
  insert(parentType: CommentParentType, parentId: string, comment: Comment): Promise<void>;
}
