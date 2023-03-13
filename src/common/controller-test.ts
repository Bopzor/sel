import { Token } from 'brandi';
import express, { ErrorRequestHandler, RequestHandler } from 'express';

import { container } from '../api/container';
import { sessionMiddleware } from '../api/session-middleware';
import { TOKENS } from '../api/tokens';
import { InMemoryMemberRepository } from '../modules/members/api/repositories/in-memory-member.repository';
import { InMemoryRequestRepository } from '../modules/requests/api/repositories/in-memory-request.repository';

import { CommandHandler } from './cqs/command-handler';
import { QueryHandler } from './cqs/query-handler';
import { FetchAgent } from './fetch-agent';

export class ControllerTest {
  app = express();
  agent = new FetchAgent(this.app);

  logError = true;

  constructor(private middleware: RequestHandler) {
    container.bind(TOKENS.memberRepository).toInstance(InMemoryMemberRepository).inSingletonScope();
    container.bind(TOKENS.requestRepository).toInstance(InMemoryRequestRepository).inSingletonScope();
  }

  async init() {
    container.capture?.();

    this.app.use(express.json());
    this.app.use(sessionMiddleware);

    this.app.post('/set-member-id', (req, res, next) => {
      req.session.memberId = req.body.memberId;
      next();
    });

    this.app.use(this.middleware);

    const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
      if (this.logError) {
        console.error(err);
      }

      res.status(500).send(err.message);
    };

    this.app.use(errorHandler);
  }

  async cleanup() {
    await this.agent.closeServer();
    container.restore?.();
  }

  async as(memberId: string) {
    const agent = new FetchAgent(this.app);

    await agent.post('/set-member-id', { memberId });

    return agent;
  }

  overrideCommandHandler(token: Token<CommandHandler<unknown>>, handle: () => void) {
    container.bind(token).toConstant({
      handle: handle as () => Promise<void>,
    });
  }

  overrideQueryHandler<Result>(token: Token<QueryHandler<unknown, Result>>, handle: () => Result) {
    container.bind(token).toConstant({
      handle: handle as () => Promise<Result>,
    });
  }
}
