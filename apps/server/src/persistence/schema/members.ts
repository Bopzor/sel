import * as shared from '@sel/shared';
import { relations } from 'drizzle-orm';
import {
  AnyPgColumn,
  boolean,
  integer,
  json,
  pgEnum,
  pgSequence,
  pgTable,
  text,
  varchar,
} from 'drizzle-orm/pg-core';

import { createdAt, date, enumValues, id, primaryKey, updatedAt } from '../schema-utils';

import { files } from './files';
import { membersInterests } from './interests';
import { memberDevices, notificationDeliveryTypeEnum } from './notifications';

export const memberStatusEnum = pgEnum('member_status', enumValues(shared.MemberStatus));
export const memberRoleEnum = pgEnum('member_role', enumValues(shared.MemberRole));

export const memberNumberSequence = pgSequence('member_number_seq');

export const members = pgTable('members', {
  id: primaryKey(),
  number: integer('number').notNull().unique(),
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
  avatarId: id('avatar_id').references((): AnyPgColumn => files.id),
  membershipStartDate: date('membership_start_date').notNull().defaultNow(),
  notificationDelivery: notificationDeliveryTypeEnum('notification_delivery').array().notNull().default([]),
  balance: integer('balance').notNull().default(0),
  roles: memberRoleEnum('roles').array().notNull().default([]),
  createdAt,
  updatedAt,
});

export const memberRelations = relations(members, ({ one, many }) => ({
  avatar: one(files, {
    fields: [members.avatarId],
    references: [files.id],
  }),
  memberInterests: many(membersInterests),
  devices: many(memberDevices),
}));
