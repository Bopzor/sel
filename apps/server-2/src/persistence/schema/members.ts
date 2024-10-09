import { pgTable, varchar } from 'drizzle-orm/pg-core';

import { createdAt, primaryKey, updatedAt } from '../schema-utils';

export const members = pgTable('members', {
  id: primaryKey(),
  firstName: varchar('first_name', { length: 256 }).notNull(),
  lastName: varchar('last_name', { length: 256 }).notNull(),
  email: varchar('email', { length: 256 }).notNull(),
  createdAt,
  updatedAt,
});
