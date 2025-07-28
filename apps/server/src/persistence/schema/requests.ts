import { RequestStatus } from '@sel/shared';
import { relations, sql } from 'drizzle-orm';
import { pgEnum, pgTable, varchar } from 'drizzle-orm/pg-core';

import { createdAt, date, enumValues, id, primaryKey, updatedAt } from '../schema-utils';

import { comments } from './comments';
import { members } from './members';
import { messages } from './messages';
import { transactions } from './transactions';

export const requestStatusEnum = pgEnum('request_status', enumValues(RequestStatus));

export const requests = pgTable('requests', {
  id: primaryKey(),
  status: requestStatusEnum('status').notNull(),
  date: date('date')
    .notNull()
    .default(sql`CURRENT_DATE`),
  requesterId: id('requester_id')
    .notNull()
    .references(() => members.id),
  title: varchar('title', { length: 256 }).notNull(),
  messageId: id('message_id').notNull(),
  createdAt,
  updatedAt,
});

export const requestsRelations = relations(requests, ({ one, many }) => ({
  requester: one(members, {
    fields: [requests.requesterId],
    references: [members.id],
  }),
  message: one(messages, {
    fields: [requests.messageId],
    references: [messages.id],
  }),
  answers: many(requestAnswers),
  comments: many(comments),
  transactions: many(transactions),
}));

export const requestAnswers = pgTable('request_answers', {
  id: primaryKey(),
  requestId: id('request_id')
    .references(() => requests.id)
    .notNull(),
  memberId: id('member_id')
    .references(() => members.id)
    .notNull(),
  date: date('date').notNull(),
  answer: varchar('answer', { length: 16, enum: ['positive', 'negative'] }).notNull(),
  createdAt,
  updatedAt,
});

export const requestAnswersRelations = relations(requestAnswers, ({ one }) => ({
  request: one(requests, {
    fields: [requestAnswers.requestId],
    references: [requests.id],
  }),
  member: one(members, {
    fields: [requestAnswers.memberId],
    references: [members.id],
  }),
}));
