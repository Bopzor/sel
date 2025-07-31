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
  attachments: many(attachments),
}));

export const attachments = pgTable('attachments', {
  id: primaryKey(),
  messageId: id('message_id').notNull(),
  fileId: id('file_id').notNull(),
});

export const attachmentsRelations = relations(attachments, ({ one }) => ({
  message: one(messages, { fields: [attachments.messageId], references: [messages.id] }),
  file: one(files, { fields: [attachments.fileId], references: [files.id] }),
}));
