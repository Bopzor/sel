import { RequestStatus } from '@sel/shared';
import { sql, relations } from 'drizzle-orm';
import { pgEnum, pgTable, text, varchar } from 'drizzle-orm/pg-core';

import { enumValues, id, createdAt, updatedAt, primaryKey, date } from '../schema-utils';

import { comments } from './comments';
import { members } from './members';

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
  text: text('text').notNull(),
  html: text('html').notNull(),
  createdAt,
  updatedAt,
});

export const requestsRelations = relations(requests, ({ one, many }) => ({
  requester: one(members, {
    fields: [requests.requesterId],
    references: [members.id],
  }),
  answers: many(requestAnswers),
  comments: many(comments),
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
