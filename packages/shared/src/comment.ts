export type Comment = {
  id: string;
  author: CommentAuthor;
  date: string;
  body: string;
};

export type CommentAuthor = {
  id: string;
  firstName: string;
  lastName: string;
};
