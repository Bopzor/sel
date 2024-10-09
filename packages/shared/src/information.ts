import { z } from 'zod';

import { LightMember } from './member';

export type Information = {
  id: string;
  body: string;
  author?: LightMember;
  publishedAt: string;
};

export const createInformationBodySchema = z.object({
  body: z.string().trim().min(15),
  isPin: z.boolean().optional(),
});
