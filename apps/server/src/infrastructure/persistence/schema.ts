import { json, pgEnum, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';

import { TokenType } from '../../authentication/token.entity';

const id = () => varchar('id', { length: 16 }).primaryKey();

const createdAt = () => timestamp('created_at', { mode: 'string', precision: 3 }).notNull();
const updatedAt = () => timestamp('updated_at', { mode: 'string', precision: 3 }).notNull();

export const members = pgTable('members', {
  id: id(),
  firstName: varchar('first_name', { length: 256 }).notNull(),
  lastName: varchar('last_name', { length: 256 }).notNull(),
  email: varchar('email', { length: 256 }).notNull().unique(),
  phoneNumbers: json('phone_numbers').notNull().default('[]'),
  bio: text('bio'),
  address: json('address'),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const tokenType = pgEnum('tokenType', [TokenType.authentication, TokenType.session]);

export const tokens = pgTable('tokens', {
  id: id(),
  value: varchar('value', { length: 256 }).notNull(),
  expirationDate: timestamp('expiration_date', { mode: 'string', precision: 3 }).notNull(),
  type: tokenType('type').notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});