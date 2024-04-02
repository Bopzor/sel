import {
  Event,
  EventKind,
  EventParticipation,
  EventsListItem,
  PhoneNumber,
  createEventBodySchema,
  setEventParticipationBodySchema,
  updateEventBodySchema,
} from '@sel/shared';
import { injectableClass } from 'ditox';
import { and, eq } from 'drizzle-orm';
import { RequestHandler, Router } from 'express';

import { container } from '../container';
import { DomainEvent } from '../domain-event';
import * as schema from '../persistence/schema';
import { TOKENS } from '../tokens';

class EventEvent extends DomainEvent {
  entity = 'event';
}

class EventCreated extends EventEvent {}
class EventUpdated extends EventEvent {}

class EventParticipationSet extends EventEvent {
  constructor(
    eventId: string,
    public readonly participation: EventParticipation,
  ) {
    super(eventId);
  }
}

class EventParticipationDeleted extends EventEvent {}

export class EventController {
  static inject = injectableClass(
    this,
    TOKENS.generator,
    TOKENS.date,
    TOKENS.eventBus,
    TOKENS.sessionProvider,
    TOKENS.htmlParser,
    TOKENS.database,
  );

  router = Router();

  constructor(
    private readonly generator = container.resolve(TOKENS.generator),
    private readonly dateAdapter = container.resolve(TOKENS.date),
    private readonly eventBus = container.resolve(TOKENS.eventBus),
    private readonly sessionProvider = container.resolve(TOKENS.sessionProvider),
    private readonly htmlParser = container.resolve(TOKENS.htmlParser),
    private readonly db = container.resolve(TOKENS.database),
  ) {
    this.router.use(this.isAuthenticated);
    this.router.get('/', this.listEvents);
    this.router.get('/:eventId', this.getEvent);
    this.router.post('/', this.createEvent);
    this.router.put('/:eventId', this.updateEvent);
    this.router.put('/:eventId/participation', this.setParticipation);
  }

  private isAuthenticated: RequestHandler = (req, res, next) => {
    this.sessionProvider.getMember();
    next();
  };

  listEvents: RequestHandler = async (req, res): Promise<void> => {
    const events = await this.db.db.query.events.findMany();

    const results: EventsListItem[] = events.map((event) => ({
      id: event.id,
      title: event.title,
      date: event.date?.toISOString() ?? undefined,
      kind: event.kind as EventKind,
    }));

    res.json(results);
  };

  getEvent: RequestHandler<{ eventId: string }> = async (req, res): Promise<void> => {
    const event = await this.db.db.query.events.findFirst({
      where: eq(schema.events.id, req.params.eventId),
      with: {
        organizer: true,
        participants: {
          with: {
            member: true,
          },
        },
      },
    });

    if (!event) {
      res.status(404).end();
      return;
    }

    const result: Event = {
      id: event.id,
      title: event.title,
      body: event.html,
      kind: event.kind as EventKind,
      date: event.date?.toISOString() ?? undefined,
      location: event.location ?? undefined,
      organizer: {
        id: event.organizer.id,
        firstName: event.organizer.firstName,
        lastName: event.organizer.lastName,
        email: event.organizer.emailVisible ? event.organizer.email : undefined,
        phoneNumbers: (event.organizer.phoneNumbers as PhoneNumber[]).filter(({ visible }) => visible),
      },
      participants: event.participants.map(({ member, participation }) => ({
        id: member.id,
        firstName: member.firstName,
        lastName: member.lastName,
        participation,
      })),
    };

    res.json(result);
  };

  createEvent: RequestHandler = async (req, res): Promise<void> => {
    const body = createEventBodySchema.parse(req.body);
    const member = this.sessionProvider.getMember();
    const now = this.dateAdapter.now();
    const eventId = this.generator.id();

    await this.db.db.transaction(async (tx) => {
      await tx.insert(schema.events).values({
        id: eventId,
        organizerId: member.id,
        title: body.title,
        text: this.htmlParser.getTextContent(body.body),
        html: body.body,
        date: body.date ? new Date(body.date) : undefined,
        location: body.location,
        kind: body.kind,
        createdAt: now,
        updatedAt: now,
      });

      this.eventBus.emit(new EventCreated(eventId));
    });

    res.status(201).send(eventId);
  };

  updateEvent: RequestHandler<{ eventId: string }> = async (req, res): Promise<void> => {
    const eventId = req.params.eventId;
    const body = updateEventBodySchema.parse(req.body);
    const now = this.dateAdapter.now();

    await this.db.db.transaction(async (tx) => {
      await tx
        .update(schema.events)
        .set({
          title: body.title,
          text: this.htmlParser.getTextContent(body.body),
          html: body.body,
          date: body.date ? new Date(body.date) : undefined,
          location: body.location,
          kind: body.kind,
          updatedAt: now,
        })
        .where(eq(schema.events.id, eventId));

      this.eventBus.emit(new EventUpdated(eventId));
    });

    res.status(204).end();
  };

  setParticipation: RequestHandler<{ eventId: string }> = async (req, res): Promise<void> => {
    const eventId = req.params.eventId;
    const member = this.sessionProvider.getMember();
    const body = setEventParticipationBodySchema.parse(req.body);
    const now = this.dateAdapter.now();

    await this.db.db.transaction(async (tx) => {
      if (body.participation !== null) {
        await tx
          .insert(schema.eventParticipations)
          .values({
            id: this.generator.id(),
            eventId,
            participantId: member.id,
            participation: body.participation,
            createdAt: now,
            updatedAt: now,
          })
          .onConflictDoUpdate({
            target: [schema.eventParticipations.eventId, schema.eventParticipations.participantId],
            set: {
              participation: body.participation,
              updatedAt: now,
            },
          });

        this.eventBus.emit(new EventParticipationSet(eventId, body.participation));
      }

      if (body.participation === null) {
        const participation = await tx.query.eventParticipations.findFirst({
          where: and(
            eq(schema.eventParticipations.eventId, eventId),
            eq(schema.eventParticipations.participantId, member.id),
          ),
        });

        if (participation) {
          await tx
            .delete(schema.eventParticipations)
            .where(eq(schema.eventParticipations.id, participation.id));

          this.eventBus.emit(new EventParticipationDeleted(eventId));
        }
      }
    });

    res.status(204).end();
  };
}
