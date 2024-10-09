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
import { publicMessages } from '../persistence/schema';
import { COMMANDS, TOKENS } from '../tokens';

import { PublicMessage } from './public-message.entity';

export class PublicMessageController {
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

    this.router.get('/', this.listPublicMessages);
    this.router.post('/', this.createPublicMessages);
  }

  authenticated: RequestHandler = (req, res, next) => {
    this.sessionProvider.getMember();
    next();
  };

  listPublicMessages: RequestHandler<never, { pin: shared.PublicMessage[]; notPin: shared.PublicMessage[] }> =
    async (req, res) => {
      const [pinMessages, notPinMessages] = await Promise.all(
        [true, false].map((isPin) =>
          this.database.db.query.publicMessages.findMany({
            with: { author: true },
            where: eq(publicMessages.isPin, isPin),
            orderBy: desc(publicMessages.publishedAt),
          }),
        ),
      );

      res.json({
        pin: pinMessages.map(this.formatPublicMessage),
        notPin: notPinMessages.map(this.formatPublicMessage),
      });
    };

  private formatPublicMessage(
    this: void,
    publicMessages: PublicMessage & { author: Record<'id' | 'firstName' | 'lastName', string> | null },
  ): shared.PublicMessage {
    return {
      id: publicMessages.id,
      body: publicMessages.html,
      publishedAt: publicMessages.publishedAt.toISOString(),
      author: publicMessages.author
        ? pick(publicMessages.author, ['id', 'firstName', 'lastName'])
        : undefined,
    };
  }

  createPublicMessages: RequestHandler<never, string, z.infer<typeof shared.createPublicMessageBodySchema>> =
    async (req, res) => {
      const { isPin, body } = shared.createPublicMessageBodySchema.parse(req.body);
      const id = this.generator.id();
      const member = this.sessionProvider.getMember();

      await this.commandBus.executeCommand(COMMANDS.createPublicMessage, {
        publicMessageId: id,
        authorId: member.id,
        body,
        isPin: isPin ?? false,
      });

      res.status(201).send(id);
    };
}
