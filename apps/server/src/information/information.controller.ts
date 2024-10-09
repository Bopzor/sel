import * as shared from '@sel/shared';
import { pick } from '@sel/utils';
import { injectableClass } from 'ditox';
import { desc, eq } from 'drizzle-orm';
import { RequestHandler, Router } from 'express';
import { z } from 'zod';

import { SessionProvider } from '../authentication/session.provider';
import { CommandBus } from '../infrastructure/cqs/command-bus';
import { GeneratorPort } from '../infrastructure/generator/generator.port';
import { Database } from '../persistence/database';
import { information } from '../persistence/schema';
import { COMMANDS, TOKENS } from '../tokens';

import { Information } from './information.entity';

export class InformationController {
  readonly router = Router();

  static inject = injectableClass(
    this,
    TOKENS.generator,
    TOKENS.sessionProvider,
    TOKENS.commandBus,
    TOKENS.database,
  );

  constructor(
    private readonly generator: GeneratorPort,
    private readonly sessionProvider: SessionProvider,
    private readonly commandBus: CommandBus,
    private readonly database: Database,
  ) {
    this.router.use(this.authenticated);

    this.router.get('/', this.listInformation);
    this.router.post('/', this.createInformation);
  }

  authenticated: RequestHandler = (req, res, next) => {
    this.sessionProvider.getMember();
    next();
  };

  listInformation: RequestHandler<never, { pin: shared.Information[]; notPin: shared.Information[] }> =
    async (req, res) => {
      const [pinMessages, notPinMessages] = await Promise.all(
        [true, false].map((isPin) =>
          this.database.db.query.information.findMany({
            with: { author: true },
            where: eq(information.isPin, isPin),
            orderBy: desc(information.publishedAt),
          }),
        ),
      );

      res.json({
        pin: pinMessages.map(this.formatInformation),
        notPin: notPinMessages.map(this.formatInformation),
      });
    };

  private formatInformation(
    this: void,
    information: Information & { author: Record<'id' | 'firstName' | 'lastName', string> | null },
  ): shared.Information {
    return {
      id: information.id,
      body: information.html,
      publishedAt: information.publishedAt.toISOString(),
      author: information.author ? pick(information.author, ['id', 'firstName', 'lastName']) : undefined,
    };
  }

  createInformation: RequestHandler<never, string, z.infer<typeof shared.createInformationBodySchema>> =
    async (req, res) => {
      const { isPin, body } = shared.createInformationBodySchema.parse(req.body);
      const id = this.generator.id();
      const member = this.sessionProvider.getMember();

      await this.commandBus.executeCommand(COMMANDS.createInformation, {
        informationId: id,
        authorId: member.id,
        body,
        isPin: isPin ?? false,
      });

      res.status(201).send(id);
    };
}
