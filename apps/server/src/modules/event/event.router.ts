import * as shared from '@sel/shared';
import { AnyColumn, eq, sql } from 'drizzle-orm';
import express from 'express';

import { container } from 'src/infrastructure/container';
import { HttpStatus, NotFound } from 'src/infrastructure/http';
import { getAuthenticatedMember } from 'src/infrastructure/session';
import { db, schema } from 'src/persistence';
import { TOKENS } from 'src/tokens';

import { Comment } from '../comment';
import { MemberWithAvatar, withAvatar } from '../member/member.entities';
import { serializeMember } from '../member/member.serializer';

import { createEventComment } from './domain/create-event-comment.command';
import { createEvent } from './domain/create-event.command';
import { setEventParticipation } from './domain/set-event-participation.command';
import { updateEvent } from './domain/update-event.command';
import { Event, EventParticipation } from './event.entities';

export const router = express.Router();

router.get('/', async (req, res) => {
  const events = await db.query.events.findMany({
    orderBy: [asc(schema.events.date, { nulls: 'first' })],
    with: {
      organizer: withAvatar,
    },
  });

  res.json(serializeEvents(events));
});

router.get('/:eventId', async (req, res) => {
  const event = await db.query.events.findFirst({
    where: eq(schema.events.id, req.params.eventId),
    with: {
      organizer: withAvatar,
      participants: {
        with: { member: withAvatar },
      },
      comments: {
        with: { author: withAvatar },
      },
    },
  });

  if (!event) {
    throw new NotFound('Event not found');
  }

  res.json(serializeEvent(event));
});

router.post('/', async (req, res) => {
  const body = shared.createEventBodySchema.parse(req.body);
  const member = getAuthenticatedMember();
  const eventId = container.resolve(TOKENS.generator).id();

  await createEvent({
    eventId: eventId,
    organizerId: member.id,
    title: body.title,
    body: body.body,
    date: body.date,
    location: body.location,
    kind: body.kind,
  });

  res.status(HttpStatus.created).send(eventId);
});

router.put('/:eventId', async (req, res) => {
  const eventId = req.params.eventId;
  const body = shared.updateEventBodySchema.parse(req.body);

  await updateEvent({
    eventId: eventId,
    title: body.title,
    body: body.body,
    date: body.date,
    location: body.location,
    kind: body.kind,
  });

  res.status(HttpStatus.noContent).end();
});

router.put('/:eventId/participation', async (req, res) => {
  const eventId = req.params.eventId;
  const member = getAuthenticatedMember();
  const body = shared.setEventParticipationBodySchema.parse(req.body);

  await setEventParticipation({
    eventId,
    memberId: member.id,
    participation: body.participation,
  });

  res.status(HttpStatus.noContent).end();
});

router.post('/:eventId/comment', async (req, res) => {
  const eventId = req.params.eventId;
  const member = getAuthenticatedMember();
  const data = shared.createCommentBodySchema.parse(req.body);
  const commentId = container.resolve(TOKENS.generator).id();

  await createEventComment({
    commentId,
    eventId,
    authorId: member.id,
    body: data.body,
  });

  res.status(HttpStatus.created).send(commentId);
});

function serializeEvents(events: Array<Event & { organizer: MemberWithAvatar }>): shared.EventsListItem[] {
  return events.map((event) => ({
    id: event.id,
    title: event.title,
    date: event.date?.toISOString() ?? undefined,
    kind: event.kind as shared.EventKind,
    organizer: serializeOrganizer(event.organizer),
  }));
}

function serializeEvent(
  event: Event & {
    organizer: MemberWithAvatar;
    participants: Array<EventParticipation & { member: MemberWithAvatar }>;
    comments: Array<Comment & { author: MemberWithAvatar }>;
  },
): shared.Event {
  return {
    id: event.id,
    title: event.title,
    body: event.html,
    kind: event.kind as shared.EventKind,
    date: event.date?.toISOString() ?? undefined,
    location: event.location ?? undefined,
    organizer: serializeOrganizer(event.organizer),
    participants: event.participants.map(({ member, participation }) => ({
      ...serializeMember(member),
      participation,
    })),
    comments: event.comments.map((comment) => ({
      id: comment.id,
      date: comment.date.toISOString(),
      author: serializeMember(comment.author),
      body: comment.html,
    })),
  };
}

function serializeOrganizer(organizer: MemberWithAvatar): shared.EventOrganizer {
  return {
    ...serializeMember(organizer),
    email: organizer.emailVisible ? organizer.email : undefined,
    phoneNumbers: (organizer.phoneNumbers as shared.PhoneNumber[]).filter(({ visible }) => visible),
  };
}

function asc(column: AnyColumn, options: { nulls: 'first' | 'last' }) {
  if (options.nulls) {
    return sql`${column} asc nulls ${sql.raw(options.nulls)}`;
  }

  return sql`${column} asc`;
}
