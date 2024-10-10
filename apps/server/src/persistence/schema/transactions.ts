import * as shared from '@sel/shared';
import { relations } from 'drizzle-orm';
import { integer, pgEnum, pgTable, text } from 'drizzle-orm/pg-core';

import { createdAt, enumValues, id, primaryKey, updatedAt } from '../schema-utils';

import { events } from './events';
import { members } from './members';
import { requests } from './requests';

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
  requestId: id('request_id').references(() => requests.id),
  eventId: id('event_id').references(() => events.id),
  createdAt,
  updatedAt,
});

export const transactionsRelations = relations(transactions, ({ one }) => ({
  payer: one(members, {
    fields: [transactions.payerId],
    references: [members.id],
  }),
  recipient: one(members, {
    fields: [transactions.recipientId],
    references: [members.id],
  }),
  creator: one(members, {
    fields: [transactions.creatorId],
    references: [members.id],
  }),
  request: one(requests, {
    fields: [transactions.requestId],
    references: [requests.id],
  }),
  event: one(events, {
    fields: [transactions.eventId],
    references: [events.id],
  }),
}));
