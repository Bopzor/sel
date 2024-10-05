import { injectableClass } from 'ditox';

import { CommandHandler } from '../../infrastructure/cqs/command-handler';
import { DatePort } from '../../infrastructure/date/date.port';
import { EventPublisherPort } from '../../infrastructure/events/event-publisher.port';
import { HtmlParserPort } from '../../infrastructure/html-parser/html-parser.port';
import { Database } from '../../persistence/database';
import { publicMessages } from '../../persistence/schema';
import { TOKENS } from '../../tokens';
import { PublicMessagePublished } from '../public-message.events';

export type CreatePublicMessageCommand = {
  publicMessageId: string;
  authorId: string;
  body: string;
};

export class CreatePublicMessage implements CommandHandler<CreatePublicMessageCommand> {
  static inject = injectableClass(
    this,
    TOKENS.date,
    TOKENS.database,
    TOKENS.eventPublisher,
    TOKENS.htmlParser,
  );

  constructor(
    private readonly dateAdapter: DatePort,
    private readonly database: Database,
    private readonly eventPublisher: EventPublisherPort,
    private readonly htmlParser: HtmlParserPort,
  ) {}

  async handle(command: CreatePublicMessageCommand): Promise<void> {
    const now = this.dateAdapter.now();

    await this.database.db.insert(publicMessages).values({
      id: command.publicMessageId,
      authorId: command.authorId,
      html: command.body,
      text: this.htmlParser.getTextContent(command.body),
      isPin: false,
      publishedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    this.eventPublisher.publish(new PublicMessagePublished(command.publicMessageId));
  }
}
