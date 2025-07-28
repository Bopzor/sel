import { relations } from 'drizzle-orm';
import { pgTable, text } from 'drizzle-orm/pg-core';

import { createdAt, id, primaryKey, updatedAt } from '../schema-utils';

import { files } from './files';

export const messages = pgTable('messages', {
  id: primaryKey(),
  text: text('text').notNull(),
  html: text('html').notNull(),
  createdAt,
  updatedAt,
});

export const messagesRelations = relations(messages, ({ many }) => ({
  attachements: many(attachements),
}));

export const attachements = pgTable('attachements', {
  id: primaryKey(),
  messageId: id('message_id').notNull(),
  fileId: id('file_id').notNull(),
});

export const attachementsRelations = relations(attachements, ({ one }) => ({
  message: one(messages, { fields: [attachements.messageId], references: [messages.id] }),
  file: one(files, { fields: [attachements.fileId], references: [files.id] }),
}));
