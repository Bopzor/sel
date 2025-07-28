import { z } from 'zod';

import { Message } from './message';

export type Comment = {
  id: string;
  author: CommentAuthor;
  date: string;
  message: Message;
};

export type CommentAuthor = {
  id: string;
  avatar?: string;
  firstName: string;
  lastName: string;
};

export type CreateCommentBody = z.infer<typeof createCommentBodySchema>;

export const createCommentBodySchema = z.object({
  body: z.string().trim().min(10),
});
