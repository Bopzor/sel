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
  payerComment?: string;
  recipientComment?: string;
  request?: { id: string; title: string };
  date: string;
};

export const listTransactionsQuerySchema = z.object({
  memberId: z.string().optional(),
});

export const listMemberTransactionsQuerySchema = z.object({
  status: z.enum(TransactionStatus).optional(),
  counterpartId: z.string().optional(),
  page: z.coerce.number().min(1).optional(),
  pageSize: z.coerce.number().min(1).max(100).default(10),
});

export type ListMemberTransactionsQuery = z.input<typeof listMemberTransactionsQuerySchema>;

export const createTransactionBodySchema = z.object({
  payerId: z.string(),
  recipientId: z.string(),
  amount: z.number().min(1).max(1000),
  description: z.string().min(1).max(80),
  comment: z.string().trim().max(4096).optional(),
  requestId: z.string().optional(),
});

export type CreateTransactionBody = z.infer<typeof createTransactionBodySchema>;

/** @deprecated Use createTransactionBodySchema, with a requestId. */
export const createRequestTransactionBodySchema = z.object({
  recipientId: z.string(),
  amount: z.number().min(1).max(1000),
  description: z.string().min(1),
});

/** @deprecated Use CreateTransactionBody, with a requestId. */
export type CreateRequestTransactionBody = z.infer<typeof createRequestTransactionBodySchema>;
