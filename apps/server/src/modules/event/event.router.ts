import { AsyncLocalStorage } from 'node:async_hooks';

import * as shared from '@sel/shared';
import { defined } from '@sel/utils';
import { AnyColumn, eq, sql } from 'drizzle-orm';
import express, { RequestHandler } from 'express';

import { container } from 'src/infrastructure/container';
import { Forbidden, HttpStatus, NotFound } from 'src/infrastructure/http';
import { getAuthenticatedMember } from 'src/infrastructure/session';
import { db, schema } from 'src/persistence';
import { TOKENS } from 'src/tokens';

import { MemberWithAvatar, withAvatar } from '../member/member.entities';
import { serializeMember } from '../member/member.serializer';
import { MessageWithAttachments, withAttachments } from '../messages/message.entities';
import { serializeMessage } from '../messages/message.serializer';

import { createEvent } from './domain/create-event.command';
import { setEventParticipation } from './domain/set-event-participation.command';
import { updateEvent } from './domain/update-event.command';
import { Event, EventParticipation } from './event.entities';
import { findEventById } from './event.persistence';

export const router = express.Router();

const eventContext = new AsyncLocalStorage<Event>();
const getEvent = () => defined(eventContext.getStore());

const isOrganizer: RequestHandler<{ eventId: string }> = async (req, res, next) => {
  const member = getAuthenticatedMember();
  const event = getEvent();

  if (event.organizerId !== member.id) {
    throw new Forbidden('Member must be the organizer of the event');
  }

  next();
};

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
      message: withAttachments,
      participants: {
        with: { member: withAvatar },
      },
    },
  });

  if (!event) {
    throw new NotFound('Event not found');
  }

  res.json(serializeEvent(event));
});

router.param('eventId', async (req, res, next) => {
  const event = await findEventById(req.params.eventId);

  if (!event) {
    next();
  } else {
    eventContext.run(event, next);
  }
});

router.post('/', async (req, res) => {
  const body = shared.createEventBodySchema.parse(req.body);
  const member = getAuthenticatedMember();
  const eventId = container.resolve(TOKENS.generator).id();

  await createEvent({
    eventId,
    organizerId: member.id,
    ...body,
    fileIds: body.fileIds ?? [],
  });

  res.status(HttpStatus.created).send(eventId);
});

router.put('/:eventId', isOrganizer, async (req, res) => {
  const eventId = req.params.eventId;
  const body = shared.updateEventBodySchema.parse(req.body);

  await updateEvent({
    eventId,
    ...body,
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
    message: MessageWithAttachments;
    participants: Array<EventParticipation & { member: MemberWithAvatar }>;
  },
): shared.Event {
  return {
    id: event.id,
    title: event.title,
    message: serializeMessage(event.message),
    kind: event.kind as shared.EventKind,
    date: event.date?.toISOString() ?? undefined,
    location: event.location ?? undefined,
    organizer: serializeOrganizer(event.organizer),
    participants: event.participants.map(({ member, participation }) => ({
      ...serializeMember(member),
      participation,
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
