import * as shared from '@sel/shared';
import { json, pgEnum, pgTable, unique, varchar } from 'drizzle-orm/pg-core';

import { createdAt, date, id, primaryKey, updatedAt } from '../schema-utils';

import { members } from './members';
import { messages } from './messages';

export const eventKindEnum = pgEnum('event_kind', ['internal', 'external']);

export const events = pgTable('events', {
  id: primaryKey(),
  organizerId: id('organizer_id')
    .references(() => members.id)
    .notNull(),
  title: varchar('title', { length: 256 }).notNull(),
  messageId: id('message_id')
    .notNull()
    .references(() => messages.id),
  date: date('date'),
  location: json('location').$type<shared.Address>(),
  kind: eventKindEnum('kind').notNull(),
  createdAt,
  updatedAt,
});

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
  (table) => [unique().on(table.eventId, table.participantId)],
);
