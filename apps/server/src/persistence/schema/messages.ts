import { pgTable, text } from 'drizzle-orm/pg-core';

import { createdAt, id, primaryKey, updatedAt } from '../schema-utils';

export const messages = pgTable('messages', {
  id: primaryKey(),
  text: text('text').notNull(),
  html: text('html').notNull(),
  createdAt,
  updatedAt,
});

export const attachments = pgTable('attachments', {
  id: primaryKey(),
  messageId: id('message_id').notNull(),
  fileId: id('file_id').notNull(),
});
