import { pgTable } from 'drizzle-orm/pg-core';

import { createdAt, date, id, primaryKey, updatedAt } from '../schema-utils';

import { events } from './events';
import { information } from './information';
import { members } from './members';
import { requests } from './requests';

export const comments = pgTable('comments', {
  id: primaryKey(),
  authorId: id('author_id')
    .references(() => members.id)
    .notNull(),
  requestId: id('request_id').references(() => requests.id),
  eventId: id('event_id').references(() => events.id),
  informationId: id('information_id').references(() => information.id),
  messageId: id('message_id').notNull(),
  date: date('date').notNull(),
  createdAt,
  updatedAt,
});
