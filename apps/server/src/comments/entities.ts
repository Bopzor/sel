export type CommentParentType = 'request';

export type Comment = {
  id: string;
  authorId: string;
  date: Date;
  body: string;
};
