import { relations, sql } from 'drizzle-orm';
import { boolean, json, pgEnum, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';

import { TokenType } from '../../authentication/token.entity';
import { MemberStatus } from '../../members/entities';
import { RequestStatus } from '../../requests/request.entity';

const id = (name = 'id') => varchar(name, { length: 16 });
const primaryKey = () => id().primaryKey();

const date = <Name extends string>(name: Name) => timestamp(name, { mode: 'date', precision: 3 });

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

export const requestStatusEnum = pgEnum('request_status', enumValues(RequestStatus));

export const requests = pgTable('requests', {
  id: primaryKey(),
  status: requestStatusEnum('status').notNull(),
  date: date('date')
    .notNull()
    .default(sql`CURRENT_DATE`),
  requesterId: id('requester_id')
    .notNull()
    .references(() => members.id),
  title: varchar('title', { length: 256 }).notNull(),
  text: text('text').notNull(),
  html: text('html').notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const requestsRelations = relations(requests, ({ one, many }) => ({
  requester: one(members, {
    fields: [requests.requesterId],
    references: [members.id],
  }),
  comments: many(comments),
}));

export const comments = pgTable('comments', {
  id: primaryKey(),
  authorId: id('author_id')
    .references(() => members.id)
    .notNull(),
  requestId: id('request_id').references(() => requests.id),
  date: date('date').notNull(),
  text: text('text').notNull(),
  html: text('html').notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const commentsRelations = relations(comments, ({ one }) => ({
  author: one(members, {
    fields: [comments.authorId],
    references: [members.id],
  }),
  request: one(requests, {
    fields: [comments.requestId],
    references: [requests.id],
  }),
}));

export const subscriptions = pgTable('subscriptions', {
  id: primaryKey(),
  active: boolean('active').notNull(),
  eventType: varchar('event_type', { length: 32 }).notNull(),
  memberId: id('member_id')
    .references(() => members.id)
    .notNull(),
  requestId: id('request_id').references(() => requests.id),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const notifications = pgTable('notifications', {
  id: primaryKey(),
  subscriptionId: id('subscription_id')
    .references(() => subscriptions.id)
    .notNull(),
  eventId: id('event_id').references(() => events.id),
  date: date('date').notNull(),
  readAt: date('read_at'),
  title: text('title').notNull(),
  content: text('content').notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});
