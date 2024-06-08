import * as shared from '@sel/shared';
import { injectableClass } from 'ditox';
import { RequestHandler, Router } from 'express';

import { SessionProvider } from '../authentication/session.provider';
import { HttpStatus } from '../http-status';
import { CommandBus } from '../infrastructure/cqs/command-bus';
import { QueryBus } from '../infrastructure/cqs/query-bus';
import { GeneratorPort } from '../infrastructure/generator/generator.port';
import { COMMANDS, QUERIES, TOKENS } from '../tokens';

export class InterestController {
  readonly router = Router();

  static inject = injectableClass(
    this,
    TOKENS.generator,
    TOKENS.sessionProvider,
    TOKENS.queryBus,
    TOKENS.commandBus,
  );

  constructor(
    private readonly generator: GeneratorPort,
    private readonly sessionProvider: SessionProvider,
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {
    this.router.use(this.authenticated);

    this.router.get('/', this.listInterests);
    this.router.post('/', this.createInterest);
    this.router.put('/:interestId/join', this.join);
    this.router.put('/:interestId/leave', this.leave);
  }

  private authenticated: RequestHandler = (req, res, next) => {
    this.sessionProvider.getMember();
    next();
  };

  public listInterests: RequestHandler<never, shared.Interest[]> = async (req, res) => {
    res.json(await this.queryBus.executeQuery(QUERIES.listInterests, {}));
  };

  public createInterest: RequestHandler<never, string> = async (req, res) => {
    const interestId = this.generator.id();
    const { label, description } = shared.createInterestBodySchema.parse(req.body);

    await this.commandBus.executeCommand(COMMANDS.createInterest, {
      interestId,
      label,
      description,
    });

    res.status(HttpStatus.created);
    res.send(interestId);
  };

  public join: RequestHandler<{ interestId: string }, shared.Interest[]> = async (req, res) => {
    const interestId = req.params.interestId;
    const { id: memberId } = this.sessionProvider.getMember();
    const { description } = shared.addInterestMemberBodySchema.parse(req.body);

    await this.commandBus.executeCommand(COMMANDS.addInterestMember, {
      interestId,
      memberId,
      description,
    });

    res.end();
  };

  public leave: RequestHandler<{ interestId: string }, shared.Interest[]> = async (req, res) => {
    const interestId = req.params.interestId;
    const { id: memberId } = this.sessionProvider.getMember();

    await this.commandBus.executeCommand(COMMANDS.removeInterestMember, {
      interestId,
      memberId,
    });

    res.end();
  };
}
