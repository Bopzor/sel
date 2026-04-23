import { z } from 'zod';

import { LightMember } from './member';
import { Message } from './message';
import { PhoneNumber } from './phone-number';

export enum RequestStatus {
  pending = 'pending',
  fulfilled = 'fulfilled',
  canceled = 'canceled',
}

export type RequestListItem = {
  id: string;
  status: RequestStatus;
  date: string;
  requester: Requester;
  title: string;
  message: Message;
};

export type Request = {
  id: string;
  status: RequestStatus;
  date: string;
  requester: Requester;
  title: string;
  message: Message;
  hasTransactions: boolean;
  answers: RequestAnswer[];
};

export type Requester = LightMember & {
  email?: string;
  phoneNumbers: PhoneNumber[];
};

export type RequestAnswer = {
  id: string;
  member: {
    id: string;
    avatar?: string;
    firstName: string;
    lastName: string;
  };
  answer: 'positive' | 'negative';
};

export const listRequestsQuerySchema = z.object({
  search: z.string().optional(),
  status: z.enum(RequestStatus).optional(),
  requesterId: z.string().optional(),
  year: z.coerce.number().optional(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(10),
});

export const createRequestBodySchema = z.object({
  title: z.string().trim().min(5).max(200),
  body: z.string().trim().min(15),
  fileIds: z.array(z.string()).default([]),
});

export type CreateRequestBody = z.infer<typeof createRequestBodySchema>;

export const updateRequestBodySchema = createRequestBodySchema;

export const setRequestAnswerBodySchema = z.object({
  answer: z.enum(['positive', 'negative']).nullable(),
});
