import { relations } from 'drizzle-orm';
import { boolean, pgEnum, pgTable, varchar } from 'drizzle-orm/pg-core';

import { TokenType } from 'src/modules/authentication/authentication.entities';

import { enumValues, id, createdAt, updatedAt, primaryKey, date } from '../schema-utils';

import { members } from './members';

export const tokenType = pgEnum('token_type', enumValues(TokenType));

export const tokens = pgTable('tokens', {
  id: primaryKey(),
  value: varchar('value', { length: 256 }).notNull().unique(),
  expirationDate: date('expiration_date').notNull(),
  type: tokenType('type').notNull(),
  memberId: id('member_id')
    .notNull()
    .references(() => members.id),
  revoked: boolean('revoked').notNull().default(false),
  createdAt,
  updatedAt,
});

export const tokensRelation = relations(tokens, ({ one }) => ({
  member: one(members, {
    fields: [tokens.memberId],
    references: [members.id],
  }),
}));
