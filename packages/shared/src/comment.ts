import { z } from 'zod';

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

export type CreateCommentBody = z.infer<typeof createCommentBodySchema>;

export const createCommentBodySchema = z.object({
  body: z.string().trim().min(10),
});
