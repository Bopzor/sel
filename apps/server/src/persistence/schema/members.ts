import * as shared from '@sel/shared';
import { relations } from 'drizzle-orm';
import { boolean, integer, json, pgEnum, pgTable, text, varchar } from 'drizzle-orm/pg-core';

import { MemberStatus } from 'src/modules/member/member.entities';

import { createdAt, date, enumValues, primaryKey, updatedAt } from '../schema-utils';

import { membersInterests } from './interests';
import { memberDevices, notificationDeliveryTypeEnum } from './notifications';

export const memberStatusEnum = pgEnum('member_status', enumValues(MemberStatus));

export const members = pgTable('members', {
  id: primaryKey(),
  status: memberStatusEnum('status').notNull(),
  firstName: varchar('first_name', { length: 256 }).notNull(),
  lastName: varchar('last_name', { length: 256 }).notNull(),
  email: varchar('email', { length: 256 }).unique().notNull(),
  emailVisible: boolean('email_visible').notNull(),
  phoneNumbers: json('phone_numbers')
    .$type<Array<{ number: string; visible: boolean }>>()
    .notNull()
    .default([]),
  bio: text('bio'),
  address: json('address').$type<shared.Address>(),
  membershipStartDate: date('membership_start_date').notNull().defaultNow(),
  notificationDelivery: notificationDeliveryTypeEnum('notification_delivery').array().notNull().default([]),
  balance: integer('balance').notNull().default(0),
  createdAt,
  updatedAt,
});

export const memberRelations = relations(members, ({ many }) => ({
  memberInterests: many(membersInterests),
  devices: many(memberDevices),
}));
