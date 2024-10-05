import { z } from 'zod';

import { LightMember } from './member';

export type PublicMessage = {
  id: string;
  body: string;
  author?: LightMember;
  publishedAt: string;
};

export const createPublicMessageBodySchema = z.object({
  body: z.string().trim().min(15),
});
