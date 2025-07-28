import { relations } from 'drizzle-orm';
import { pgTable } from 'drizzle-orm/pg-core';

import { createdAt, date, id, primaryKey, updatedAt } from '../schema-utils';

import { events } from './events';
import { information } from './information';
import { members } from './members';
import { messages } from './messages';
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
  information: one(information, {
    fields: [comments.informationId],
    references: [information.id],
  }),
  message: one(messages, {
    fields: [comments.messageId],
    references: [messages.id],
  }),
}));
