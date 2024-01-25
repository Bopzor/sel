export type CommentParentType = 'request';

export type Comment = {
  id: string;
  authorId: string;
  entityId: string;
  date: Date;
  text: string;
};
