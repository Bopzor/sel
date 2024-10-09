import { pgTable, varchar } from 'drizzle-orm/pg-core';

const id = (name = 'id') => varchar(name, { length: 16 });
const primaryKey = () => id().primaryKey();

export const members = pgTable('members', {
  id: primaryKey(),
  firstName: varchar('first_name', { length: 256 }).notNull(),
  lastName: varchar('last_name', { length: 256 }).notNull(),
});
