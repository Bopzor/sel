import { integer, pgTable, varchar } from 'drizzle-orm/pg-core';

import { createdAt, id, primaryKey, updatedAt } from '../schema-utils';

import { members } from './members';

export const files = pgTable('files', {
  id: primaryKey(),
  name: varchar('name', { length: 256 }).notNull(),
  originalName: varchar('original_name', { length: 1024 }).notNull(),
  mimetype: varchar('mimetype', { length: 32 }).notNull(),
  size: integer('size').notNull(),
  uploadedBy: id('uploaded_by')
    .references(() => members.id)
    .notNull(),
  createdAt,
  updatedAt,
});
