export type Comment = {
  id: string;
  author: CommentAuthor;
  date: string;
  body: string;
};

export type CommentAuthor = {
  firstName: string;
  lastName: string;
  email?: string;
};
