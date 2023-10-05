import { json, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';

export const members = pgTable('members', {
  id: varchar('id', { length: 16 }).primaryKey(),
  firstName: varchar('first_name', { length: 256 }).notNull(),
  lastName: varchar('last_name', { length: 256 }).notNull(),
  email: varchar('email', { length: 256 }).notNull().unique(),
  phoneNumbers: json('phone_numbers').notNull().default('[]'),
  bio: text('bio'),
  address: json('address'),
  createdAt: timestamp('created_at'),
  updatedAt: timestamp('updated_at'),
});
