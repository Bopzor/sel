import { pgTable, varchar } from 'drizzle-orm/pg-core';

import { createdAt, date, id, primaryKey, updatedAt } from '../schema-utils';

import { members } from './members';
import { messages } from './messages';

export const information = pgTable('information', {
  id: primaryKey(),
  title: varchar('title', { length: 256 }).notNull(),
  messageId: id('message_id')
    .notNull()
    .references(() => messages.id),
  authorId: id('author_id').references(() => members.id),
  publishedAt: date('published_at').notNull(),
  createdAt,
  updatedAt,
});
