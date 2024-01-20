import { Comment, CommentParentType } from './entities';

export interface CommentsRepository {
  getComment(commentId: string): Promise<Comment | undefined>;
  insert(parentType: CommentParentType, parentId: string, comment: Comment): Promise<void>;
}
