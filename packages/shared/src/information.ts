import { z } from 'zod';

import { Comment } from './comment';
import { LightMember } from './member';

export type Information = {
  id: string;
  body: string;
  author?: LightMember;
  publishedAt: string;
  comments: Comment[];
};

export const createInformationBodySchema = z.object({
  body: z.string().trim().min(15),
  isPin: z.boolean().optional(),
});
