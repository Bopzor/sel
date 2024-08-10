import { z } from 'zod';

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
  payerId: string;
  recipientId: string;
  creatorId: string;
};

export const createTransactionBodySchema = z.object({
  payerId: z.string(),
  recipientId: z.string(),
  amount: z.number().min(1).max(1000),
  description: z.string().min(1),
});

export type CreateTransactionBody = z.infer<typeof createTransactionBodySchema>;
