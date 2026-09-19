import { RequestStatus } from '@sel/shared';
import { sql } from 'drizzle-orm';
import { pgEnum, pgTable, varchar } from 'drizzle-orm/pg-core';

import { createdAt, date, enumValues, id, primaryKey, updatedAt } from '../schema-utils';

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
  messageId: id('message_id').notNull(),
  createdAt,
  updatedAt,
});

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
