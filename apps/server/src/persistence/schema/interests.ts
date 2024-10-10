import { relations } from 'drizzle-orm';
import { pgTable, text, varchar } from 'drizzle-orm/pg-core';

import { createdAt, updatedAt, id, primaryKey } from '../schema-utils';

import { members } from './members';

export const interests = pgTable('interests', {
  id: primaryKey(),
  label: varchar('label', { length: 256 }).notNull(),
  description: text('description').notNull(),
  createdAt,
  updatedAt,
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
  createdAt,
  updatedAt,
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
