import * as shared from '@sel/shared';
import { relations, sql } from 'drizzle-orm';
import {
  boolean,
  integer,
  json,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  varchar,
} from 'drizzle-orm/pg-core';

import { TokenType } from '../authentication/token.entity';
import { NotificationDeliveryType } from '../common/notification-delivery-type';
import { MemberStatus } from '../members/member.entity';
import { RequestStatus } from '../requests/request.entity';

const id = (name = 'id') => varchar(name, { length: 16 });
const primaryKey = () => id().primaryKey();

const date = <Name extends string>(name: Name) => timestamp(name, { mode: 'date', precision: 3 });

const createdAt = () => date('created_at').notNull();
const updatedAt = () => date('updated_at').notNull();

const enumValues = <Values extends string>(enumType: Record<string, Values>) => {
  return Object.values(enumType) as [Values, ...Values[]];
};

export const notificationDeliveryTypeEnum = pgEnum(
  'notification_delivery_type',
  enumValues(NotificationDeliveryType),
);

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
  address: json('address').$type<shared.Address>(),
  membershipStartDate: date('membership_start_date')
    .notNull()
    .default(sql`CURRENT_DATE`),
  notificationDelivery: notificationDeliveryTypeEnum('notification_delivery').array().notNull().default([]),
  balance: integer('balance').notNull().default(0),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const memberRelations = relations(members, ({ many }) => ({
  memberInterests: many(membersInterests),
  devices: many(memberDevices),
}));

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

export const domainEvents = pgTable('domain_events', {
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
  answers: many(requestAnswers),
  comments: many(comments),
}));

export const requestAnswers = pgTable('request_answers', {
  id: primaryKey(),
  requestId: id('request_id')
    .references(() => requests.id)
    .notNull(),
  memberId: id('member_id')
    .references(() => members.id)
    .notNull(),
  date: date('date').notNull(),
  answer: varchar('answer', { length: 16, enum: ['positive', 'negative'] }).notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const requestAnswersRelations = relations(requestAnswers, ({ one }) => ({
  request: one(requests, {
    fields: [requestAnswers.requestId],
    references: [requests.id],
  }),
  member: one(members, {
    fields: [requestAnswers.memberId],
    references: [members.id],
  }),
}));

export const comments = pgTable('comments', {
  id: primaryKey(),
  authorId: id('author_id')
    .references(() => members.id)
    .notNull(),
  requestId: id('request_id').references(() => requests.id),
  eventId: id('event_id').references(() => events.id),
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
  event: one(events, {
    fields: [comments.eventId],
    references: [events.id],
  }),
}));

export const notifications = pgTable('notifications', {
  id: primaryKey(),
  memberId: id('member_id')
    .references(() => members.id)
    .notNull(),
  type: varchar('type', { length: 32 }).$type<shared.NotificationType>().notNull(),
  date: date('date').notNull(),
  context: json('context').$type<shared.NotificationData[shared.NotificationType]>().notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const notificationsRelations2 = relations(notifications, ({ many }) => ({
  deliveries: many(notificationDeliveries),
}));

export const notificationDeliveries = pgTable('notification_deliveries', {
  id: primaryKey(),
  notificationId: id('notification_id')
    .references(() => notifications.id)
    .notNull(),
  type: notificationDeliveryTypeEnum('delivery_type').notNull(),
  target: text('target').notNull(),
  delivered: boolean('delivered').notNull().default(false),
  error: json('error'),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const memberDevices = pgTable(
  'member_device',
  {
    id: primaryKey(),
    memberId: id('member_id')
      .references(() => members.id)
      .notNull(),
    deviceSubscription: text('device_subscription').notNull(),
    deviceType: varchar('device_type', { length: 32 }).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => ({
    unique: unique().on(table.memberId, table.deviceSubscription),
  }),
);

export const memberDevicesRelations = relations(memberDevices, ({ one }) => ({
  member: one(members, {
    fields: [memberDevices.memberId],
    references: [members.id],
  }),
}));

export const eventKindEnum = pgEnum('event_kind', ['internal', 'external']);

export const events = pgTable('events', {
  id: primaryKey(),
  organizerId: id('organizer_id')
    .references(() => members.id)
    .notNull(),
  title: varchar('title', { length: 256 }).notNull(),
  text: text('text').notNull(),
  html: text('html').notNull(),
  date: date('date'),
  location: json('location').$type<shared.Address>(),
  kind: eventKindEnum('kind').notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const eventsRelations = relations(events, ({ one, many }) => ({
  organizer: one(members, {
    fields: [events.organizerId],
    references: [members.id],
  }),
  participants: many(eventParticipations),
  comments: many(comments),
}));

export const eventParticipation = pgEnum('event_participation', ['yes', 'no']);

export const eventParticipations = pgTable(
  'event_participations',
  {
    id: primaryKey(),
    eventId: id('event_id')
      .references(() => events.id)
      .notNull(),
    participantId: id('participant_id')
      .references(() => members.id)
      .notNull(),
    participation: eventParticipation('participation').notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => ({
    unique: unique().on(table.eventId, table.participantId),
  }),
);

export const eventParticipationsRelations = relations(eventParticipations, ({ one }) => ({
  event: one(events, {
    fields: [eventParticipations.eventId],
    references: [events.id],
  }),
  member: one(members, {
    fields: [eventParticipations.participantId],
    references: [members.id],
  }),
}));

export const interests = pgTable('interests', {
  id: primaryKey(),
  label: varchar('label', { length: 256 }).notNull(),
  description: text('description').notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const interestsRelations = relations(interests, ({ many }) => ({
  membersInterests: many(membersInterests),
}));

export const membersInterests = pgTable('members_interests', {
  id: primaryKey(),
  memberId: id('member_id')
    .references(() => members.id)
    .notNull(),
  interestId: id('interest_id')
    .references(() => interests.id)
    .notNull(),
  description: text('description'),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const membersInterestsRelations = relations(membersInterests, ({ one }) => ({
  member: one(members, {
    fields: [membersInterests.memberId],
    references: [members.id],
  }),
  interest: one(interests, {
    fields: [membersInterests.interestId],
    references: [interests.id],
  }),
}));

export const transactionStatus = pgEnum('transaction_status', enumValues(shared.TransactionStatus));

export const transactions = pgTable('transactions', {
  id: primaryKey(),
  status: transactionStatus('status').notNull(),
  description: text('description').notNull(),
  amount: integer('amount').notNull(),
  payerId: id('payer_id')
    .references(() => members.id)
    .notNull(),
  recipientId: id('recipient_id')
    .references(() => members.id)
    .notNull(),
  payerComment: text('payer_comment'),
  recipientComment: text('recipient_comment'),
  creatorId: id('creator_id')
    .references(() => members.id)
    .notNull(),
  requestId: id('request_id').references(() => requests.id),
  eventId: id('event_id').references(() => events.id),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const transactionsRelations = relations(transactions, ({ one }) => ({
  payer: one(members, {
    fields: [transactions.payerId],
    references: [members.id],
  }),
  recipient: one(members, {
    fields: [transactions.recipientId],
    references: [members.id],
  }),
  creator: one(members, {
    fields: [transactions.creatorId],
    references: [members.id],
  }),
  request: one(requests, {
    fields: [transactions.requestId],
    references: [requests.id],
  }),
  event: one(events, {
    fields: [transactions.eventId],
    references: [events.id],
  }),
}));

export const config = pgTable('config', {
  id: primaryKey(),
  currency: varchar('currency', { length: 256 }).notNull(),
  currencyPlural: varchar('currency_plural', { length: 256 }).notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});
