import { relations, sql } from 'drizzle-orm';
import { boolean, json, pgEnum, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';

import { TokenType } from '../../authentication/token.entity';
import { MemberStatus } from '../../members/entities';

const id = (name = 'id') => varchar(name, { length: 16 });
const primaryKey = () => id().primaryKey();
const date = (name: string) => timestamp(name, { mode: 'string', precision: 3 });

const createdAt = () => date('created_at').notNull();
const updatedAt = () => date('updated_at').notNull();

const enumValues = <Values extends string>(enumType: Record<string, Values>) => {
  return Object.values(enumType) as [Values, ...Values[]];
};

export const memberStatusEnum = pgEnum('member_status', enumValues(MemberStatus));

export const members = pgTable('members', {
  id: primaryKey(),
  status: memberStatusEnum('status').notNull(),
  firstName: varchar('first_name', { length: 256 }).notNull(),
  lastName: varchar('last_name', { length: 256 }).notNull(),
  email: varchar('email', { length: 256 }).notNull().unique(),
  emailVisible: boolean('email_visible').notNull(),
  phoneNumbers: json('phone_numbers').notNull().default('[]'),
  bio: text('bio'),
  address: json('address'),
  membershipStartDate: date('membership_start_date')
    .notNull()
    .default(sql`CURRENT_DATE`),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

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
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const tokensRelation = relations(tokens, ({ one }) => ({
  member: one(members, {
    fields: [tokens.memberId],
    references: [members.id],
  }),
}));

export const events = pgTable('events', {
  id: primaryKey(),
  entity: varchar('entity', { length: 256 }).notNull(),
  entityId: id('entity_id').notNull(),
  type: varchar('type', { length: 256 }).notNull(),
  payload: json('payload'),
  createdAt: createdAt(),
});
