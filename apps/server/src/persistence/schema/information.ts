import { relations } from 'drizzle-orm';
import { pgTable, varchar } from 'drizzle-orm/pg-core';

import { createdAt, date, id, primaryKey, updatedAt } from '../schema-utils';

import { comments } from './comments';
import { members } from './members';
import { messages } from './messages';

export const information = pgTable('information', {
  id: primaryKey(),
  title: varchar('title', { length: 256 }).notNull(),
  messageId: id('message_id').notNull(),
  authorId: id('author_id').references(() => members.id),
  publishedAt: date('published_at').notNull(),
  createdAt,
  updatedAt,
});

export const informationRelations = relations(information, ({ one, many }) => ({
  author: one(members, {
    fields: [information.authorId],
    references: [members.id],
  }),
  message: one(messages, {
    fields: [information.messageId],
    references: [messages.id],
  }),
  comments: many(comments),
}));
