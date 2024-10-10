import { relations } from 'drizzle-orm';
import { boolean, pgTable, text } from 'drizzle-orm/pg-core';

import { id, createdAt, updatedAt, primaryKey, date } from '../schema-utils';

import { members } from './members';

export const information = pgTable('information', {
  id: primaryKey(),
  text: text('text').notNull(),
  html: text('html').notNull(),
  isPin: boolean('is_pin').notNull(),
  authorId: id('author_id').references(() => members.id),
  publishedAt: date('published_at').notNull(),
  createdAt,
  updatedAt,
});

export const informationRelations = relations(information, ({ one }) => ({
  author: one(members, {
    fields: [information.authorId],
    references: [members.id],
  }),
}));
