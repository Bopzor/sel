import * as shared from '@sel/shared';
import { relations } from 'drizzle-orm';
import { boolean, json, pgEnum, pgTable, text, unique, varchar } from 'drizzle-orm/pg-core';

import { NotificationDeliveryType } from 'src/modules/notification/notification.entities';

import { id, createdAt, updatedAt, primaryKey, date, enumValues } from '../schema-utils';

import { members } from './members';

export const notificationDeliveryTypeEnum = pgEnum(
  'notification_delivery_type',
  enumValues(NotificationDeliveryType),
);

export const memberDevices = pgTable(
  'member_device',
  {
    id: primaryKey(),
    memberId: id('member_id')
      .references(() => members.id)
      .notNull(),
    deviceSubscription: text('device_subscription').notNull(),
    deviceType: varchar('device_type', { length: 32 }).notNull(),
    createdAt,
    updatedAt,
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

export const notifications = pgTable('notifications', {
  id: primaryKey(),
  memberId: id('member_id')
    .references(() => members.id)
    .notNull(),
  type: varchar('type', { length: 32 }).$type<shared.NotificationType>().notNull(),
  date: date('date').notNull(),
  context: json('context').$type<shared.NotificationData[shared.NotificationType]>().notNull(),
  createdAt,
  updatedAt,
});

export const notificationDeliveries = pgTable('notification_deliveries', {
  id: primaryKey(),
  notificationId: id('notification_id')
    .references(() => notifications.id)
    .notNull(),
  type: notificationDeliveryTypeEnum('delivery_type').notNull(),
  target: text('target').notNull(),
  delivered: boolean('delivered').notNull().default(false),
  error: json('error'),
  createdAt,
  updatedAt,
});
