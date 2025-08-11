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

export type CommentEntityType = 'request' | 'event' | 'information';

export const commentForEntitySchema = z.object({
  type: z.literal<CommentEntityType[]>(['request', 'event', 'information']),
  entityId: z.string(),
});

export const createCommentBodySchema = z.object({
  body: z.string().trim().min(10),
  fileIds: z.array(z.string()).default([]),
});
export type CreateCommentBody = z.infer<typeof createCommentBodySchema>;

export const createCommentBodyWithEntitySchema = createCommentBodySchema.extend(commentForEntitySchema.shape);
export type CreateCommentBodyWithEntity = z.infer<typeof createCommentBodyWithEntitySchema>;
