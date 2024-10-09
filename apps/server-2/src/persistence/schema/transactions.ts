import * as shared from '@sel/shared';
import { integer, pgEnum, pgTable, text } from 'drizzle-orm/pg-core';

import { createdAt, enumValues, id, primaryKey, updatedAt } from '../schema-utils';

import { members } from './members';

export const transactionStatus = pgEnum('transaction_status', enumValues(shared.TransactionStatus));

export const transactions = pgTable('transactions', {
  id: primaryKey(),
  status: transactionStatus('status').notNull(),
  description: text('description').notNull(),
  amount: integer('amount').notNull(),
  payerId: id('payer_id')
    .references(() => members.id)
    .notNull(),
  recipientId: id('recipient_id')
    .references(() => members.id)
    .notNull(),
  payerComment: text('payer_comment'),
  recipientComment: text('recipient_comment'),
  creatorId: id('creator_id')
    .references(() => members.id)
    .notNull(),
  createdAt,
  updatedAt,
});
