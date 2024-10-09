import { injectableClass } from 'ditox';

import { CommandHandler } from '../../infrastructure/cqs/command-handler';
import { DatePort } from '../../infrastructure/date/date.port';
import { EventPublisherPort } from '../../infrastructure/events/event-publisher.port';
import { HtmlParserPort } from '../../infrastructure/html-parser/html-parser.port';
import { Database } from '../../persistence/database';
import { information } from '../../persistence/schema';
import { TOKENS } from '../../tokens';
import { InformationPublished } from '../information.events';

export type CreateInformationCommand = {
  informationId: string;
  authorId: string;
  body: string;
  isPin: boolean;
};

export class CreateInformation implements CommandHandler<CreateInformationCommand> {
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

  async handle(command: CreateInformationCommand): Promise<void> {
    const now = this.dateAdapter.now();

    await this.database.db.insert(information).values({
      id: command.informationId,
      authorId: command.isPin ? undefined : command.authorId,
      html: command.body,
      text: this.htmlParser.getTextContent(command.body),
      isPin: command.isPin,
      publishedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    this.eventPublisher.publish(new InformationPublished(command.informationId));
  }
}
