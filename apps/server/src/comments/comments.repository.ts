import { Comment, CommentParentType } from './entities';

export interface CommentsRepository {
  insert(parentType: CommentParentType, parentId: string, comment: Comment): Promise<void>;
}
