import * as shared from '@sel/shared';
import { relations } from 'drizzle-orm';
import { json, pgEnum, pgTable, text, unique, varchar } from 'drizzle-orm/pg-core';

import { id, createdAt, updatedAt, primaryKey, date } from '../schema-utils';

import { comments } from './comments';
import { members } from './members';

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
  createdAt,
  updatedAt,
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
    createdAt,
    updatedAt,
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
