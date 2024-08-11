import { z } from 'zod';

import { LightMember } from './member';

export enum TransactionStatus {
  pending = 'pending',
  completed = 'completed',
  canceled = 'canceled',
}

export type Transaction = {
  id: string;
  status: TransactionStatus;
  amount: number;
  description: string;
  payer: LightMember;
  recipient: LightMember;
  date: string;
};

export const createTransactionBodySchema = z.object({
  payerId: z.string(),
  recipientId: z.string(),
  amount: z.number().min(1).max(1000),
  description: z.string().min(1),
});

export type CreateTransactionBody = z.infer<typeof createTransactionBodySchema>;

export const createRequestTransactionBodySchema = z.object({
  recipientId: z.string(),
  amount: z.number().min(1).max(1000),
  description: z.string().min(1),
});

export type CreateRequestTransactionBody = z.infer<typeof createRequestTransactionBodySchema>;
