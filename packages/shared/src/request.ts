import { z } from 'zod';

import { Comment } from './comment';
import { LightMember } from './member';
import { Message } from './message';
import { PhoneNumber } from './phone-number';

export enum RequestStatus {
  pending = 'pending',
  fulfilled = 'fulfilled',
  canceled = 'canceled',
}

export type Request = {
  id: string;
  status: RequestStatus;
  date: string;
  requester: Requester;
  title: string;
  message: Message;
  hasTransactions: boolean;
  answers: RequestAnswer[];
  comments: Comment[];
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
