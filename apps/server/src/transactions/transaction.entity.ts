import { createDate, createFactory, createId } from '@sel/utils';

import * as schema from '../persistence/schema';

export type Transaction = typeof schema.transactions.$inferSelect;

export const createTransaction = createFactory<Transaction>(() => ({
  id: createId(),
  status: 'pending',
  description: '',
  amount: 0,
  payerId: '',
  recipientId: '',
  payerComment: null,
  recipientComment: null,
  creatorId: '',
  createdAt: createDate(),
  updatedAt: createDate(),
}));
