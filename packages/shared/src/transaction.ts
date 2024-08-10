import { z } from 'zod';

export type Transaction = {
  id: string;
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
