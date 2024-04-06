export type CommentParentType = 'request' | 'event';

export type Comment = {
  id: string;
  authorId: string;
  entityId: string;
  date: Date;
  text: string;
};
