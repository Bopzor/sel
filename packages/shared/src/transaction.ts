import type { ValueOf } from '@sel/utils';
import { z } from 'zod';

import type { LightMember } from './member';

export const TransactionStatus = {
  pending: 'pending',
  completed: 'completed',
  canceled: 'canceled',
} as const;

export type TransactionStatus = ValueOf<typeof TransactionStatus>;

export type Transaction = {
  id: string;
  status: TransactionStatus;
  amount: number;
  description: string;
  payer: LightMember;
  recipient: LightMember;
  date: string;
};

export const listTransactionsQuerySchema = z.object({
  memberId: z.string().optional(),
});

export const createTransactionBodySchema = z.object({
  payerId: z.string(),
  recipientId: z.string(),
  amount: z.number().min(1).max(1000),
  description: z.string().min(1).max(80),
});

export type CreateTransactionBody = z.infer<typeof createTransactionBodySchema>;

export const createRequestTransactionBodySchema = z.object({
  recipientId: z.string(),
  amount: z.number().min(1).max(1000),
  description: z.string().min(1),
});

export type CreateRequestTransactionBody = z.infer<typeof createRequestTransactionBodySchema>;
