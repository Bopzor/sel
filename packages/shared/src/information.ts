import { z } from 'zod';

import { Comment } from './comment';
import { LightMember } from './member';
import { Message } from './message';

export type Information = {
  id: string;
  title: string;
  message: Message;
  author?: LightMember;
  publishedAt: string;
  comments: Comment[];
};

export const createInformationBodySchema = z.object({
  title: z.string().trim().min(5).max(255),
  body: z.string().trim().min(15),
  fileIds: z.array(z.string()).optional(),
});

export type CreateInformationBody = z.infer<typeof createInformationBodySchema>;
