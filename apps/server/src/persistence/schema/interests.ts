import { pgTable, text, varchar } from 'drizzle-orm/pg-core';

import { createdAt, updatedAt, id, primaryKey } from '../schema-utils';

import { files } from './files';
import { members } from './members';

export const interests = pgTable('interests', {
  id: primaryKey(),
  label: varchar('label', { length: 256 }).notNull(),
  description: text('description').notNull(),
  imageId: id('image_id').references(() => files.id),
  createdAt,
  updatedAt,
});

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
