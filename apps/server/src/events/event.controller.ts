import {
  createCommentBodySchema,
  createEventBodySchema,
  setEventParticipationBodySchema,
  updateEventBodySchema,
} from '@sel/shared';
import { injectableClass } from 'ditox';
import { RequestHandler, Router } from 'express';

import { container } from '../container';
import { HttpStatus } from '../http-status';
import { COMMANDS, QUERIES, TOKENS } from '../tokens';

export class EventController {
  static inject = injectableClass(
    this,
    TOKENS.generator,
    TOKENS.sessionProvider,
    TOKENS.commandBus,
    TOKENS.queryBus,
  );

  router = Router();

  constructor(
    private readonly generator = container.resolve(TOKENS.generator),
    private readonly sessionProvider = container.resolve(TOKENS.sessionProvider),
    private readonly commandBus = container.resolve(TOKENS.commandBus),
    private readonly queryBus = container.resolve(TOKENS.queryBus),
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

  listEvents: RequestHandler = async (req, res): Promise<void> => {
    res.json(await this.queryBus.executeQuery(QUERIES.listEvents, {}));
  };

  getEvent: RequestHandler<{ eventId: string }> = async (req, res): Promise<void> => {
    const result = await this.queryBus.executeQuery(QUERIES.getEvent, { eventId: req.params.eventId });

    if (result) {
      res.json(result);
    } else {
      res.status(HttpStatus.notFound).end();
    }
  };

  createEvent: RequestHandler = async (req, res): Promise<void> => {
    const body = createEventBodySchema.parse(req.body);
    const member = this.sessionProvider.getMember();
    const eventId = this.generator.id();

    await this.commandBus.executeCommand(COMMANDS.createEvent, {
      eventId: eventId,
      organizerId: member.id,
      title: body.title,
      body: body.body,
      date: body.date,
      location: body.location,
      kind: body.kind,
    });

    res.status(HttpStatus.created).send(eventId);
  };

  updateEvent: RequestHandler<{ eventId: string }> = async (req, res): Promise<void> => {
    const eventId = req.params.eventId;
    const body = updateEventBodySchema.parse(req.body);

    await this.commandBus.executeCommand(COMMANDS.updateEvent, {
      eventId: eventId,
      title: body.title,
      body: body.body,
      date: body.date,
      location: body.location,
      kind: body.kind,
    });

    res.status(HttpStatus.noContent).end();
  };

  setParticipation: RequestHandler<{ eventId: string }> = async (req, res): Promise<void> => {
    const eventId = req.params.eventId;
    const member = this.sessionProvider.getMember();
    const body = setEventParticipationBodySchema.parse(req.body);

    await this.commandBus.executeCommand(COMMANDS.setEventParticipation, {
      eventId,
      memberId: member.id,
      participation: body.participation,
    });

    res.status(HttpStatus.noContent).end();
  };

  createComment: RequestHandler<{ eventId: string }> = async (req, res): Promise<void> => {
    const eventId = req.params.eventId;
    const member = this.sessionProvider.getMember();
    const data = createCommentBodySchema.parse(req.body);
    const commentId = this.generator.id();

    await this.commandBus.executeCommand(COMMANDS.createEventComment, {
      commentId,
      eventId,
      authorId: member.id,
      text: data.body,
    });

    res.status(HttpStatus.created).send(commentId);
  };
}
