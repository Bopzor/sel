import { z } from 'zod';

import type { LightMember } from './member';
import type { Message } from './message';

export type Information = {
  id: string;
  title: string;
  message: Message;
  author?: LightMember;
  publishedAt: string;
};

export const listInformationQuerySchema = z.object({
  search: z.string().optional(),
  authorId: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(10),
});

export type ListInformationQuery = z.input<typeof listInformationQuerySchema>;

export const createInformationBodySchema = z.object({
  title: z.string().trim().min(5).max(255),
  body: z.string().trim().min(15),
  fileIds: z.array(z.string()).default([]),
});

export type CreateInformationBody = z.infer<typeof createInformationBodySchema>;

export const updateInformationBodySchema = createInformationBodySchema;
