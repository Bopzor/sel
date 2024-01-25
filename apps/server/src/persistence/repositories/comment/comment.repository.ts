import { Comment, CommentParentType } from '../../../comments/comment.entity';

export interface CommentRepository {
  getComment(commentId: string): Promise<Comment | undefined>;
  insert(parentType: CommentParentType, parentId: string, comment: Comment): Promise<void>;
}
