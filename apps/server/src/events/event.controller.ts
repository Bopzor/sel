import {
  Event,
  EventKind,
  EventOrganizer,
  EventsListItem,
  PhoneNumber,
  createEventCommentBodySchema,
  createEventBodySchema,
  setEventParticipationBodySchema,
  updateEventBodySchema,
} from '@sel/shared';
import { injectableClass } from 'ditox';
import { and, eq } from 'drizzle-orm';
import { RequestHandler, Router } from 'express';

import { container } from '../container';
import * as schema from '../persistence/schema';
import { COMMANDS, TOKENS } from '../tokens';

import { EventCreated, EventUpdated, EventParticipationSet, EventParticipationDeleted } from './event-events';

export class EventController {
  static inject = injectableClass(
    this,
    TOKENS.generator,
    TOKENS.date,
    TOKENS.eventBus,
    TOKENS.sessionProvider,
    TOKENS.htmlParser,
    TOKENS.database,
    TOKENS.commandBus,
  );

  router = Router();

  constructor(
    private readonly generator = container.resolve(TOKENS.generator),
    private readonly dateAdapter = container.resolve(TOKENS.date),
    private readonly eventBus = container.resolve(TOKENS.eventBus),
    private readonly sessionProvider = container.resolve(TOKENS.sessionProvider),
    private readonly htmlParser = container.resolve(TOKENS.htmlParser),
    private readonly db = container.resolve(TOKENS.database),
    private readonly commandBus = container.resolve(TOKENS.commandBus),
  ) {
    this.router.use(this.isAuthenticated);
    this.router.get('/', this.listEvents);
    this.router.get('/:eventId', this.getEvent);
    this.router.post('/', this.createEvent);
    this.router.put('/:eventId', this.updateEvent);
    this.router.put('/:eventId/participation', this.setParticipation);
    this.router.post('/:eventId/comment', this.createComment);
  }

  private isAuthenticated: RequestHandler = (req, res, next) => {
    this.sessionProvider.getMember();
    next();
  };

  private serializeOrganizer(organizer: typeof schema.members.$inferSelect): EventOrganizer {
    return {
      id: organizer.id,
      firstName: organizer.firstName,
      lastName: organizer.lastName,
      email: organizer.emailVisible ? organizer.email : undefined,
      phoneNumbers: (organizer.phoneNumbers as PhoneNumber[]).filter(({ visible }) => visible),
    };
  }

  listEvents: RequestHandler = async (req, res): Promise<void> => {
    const events = await this.db.db.query.events.findMany({
      with: {
        organizer: true,
      },
    });

    const results: EventsListItem[] = events.map((event) => ({
      id: event.id,
      title: event.title,
      date: event.date?.toISOString() ?? undefined,
      kind: event.kind as EventKind,
      organizer: this.serializeOrganizer(event.organizer),
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
        comments: {
          with: {
            author: true,
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
      organizer: this.serializeOrganizer(event.organizer),
      participants: event.participants.map(({ member, participation }) => ({
        id: member.id,
        firstName: member.firstName,
        lastName: member.lastName,
        participation,
      })),
      comments: event.comments.map((comment) => ({
        id: comment.id,
        date: comment.date.toISOString(),
        author: {
          id: comment.author.id,
          firstName: comment.author.firstName,
          lastName: comment.author.lastName,
        },
        body: comment.html,
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

  // todo: check is author
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

  createComment: RequestHandler<{ eventId: string }> = async (req, res): Promise<void> => {
    const eventId = req.params.eventId;
    const member = this.sessionProvider.getMember();
    const data = createEventCommentBodySchema.parse(req.body);
    const commentId = this.generator.id();

    await this.commandBus.executeCommand(COMMANDS.createEventComment, {
      commentId,
      eventId,
      authorId: member.id,
      text: data.body,
    });

    res.status(201).send(commentId);
  };
}
