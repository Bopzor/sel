import { z } from 'zod';

import { Comment } from './comment';
import { LightMember } from './member';
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
  body: string;
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
    firstName: string;
    lastName: string;
  };
  answer: 'positive' | 'negative';
};

export const createRequestBodySchema = z.object({
  title: z.string().trim().min(5).max(200),
  body: z.string().trim().min(15),
});

export const updateRequestBodySchema = createRequestBodySchema;

export const setRequestAnswerBodySchema = z.object({
  answer: z.enum(['positive', 'negative']).nullable(),
});
