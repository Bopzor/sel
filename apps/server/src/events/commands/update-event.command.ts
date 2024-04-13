import * as shared from '@sel/shared';
import { injectableClass } from 'ditox';
import { eq } from 'drizzle-orm';

import { CommandHandler } from '../../infrastructure/cqs/command-handler';
import { DatePort } from '../../infrastructure/date/date.port';
import { EventPublisher } from '../../infrastructure/events/event-publisher';
import { HtmlParserPort } from '../../infrastructure/html-parser/html-parser.port';
import { Database } from '../../persistence/database';
import * as schema from '../../persistence/schema';
import { TOKENS } from '../../tokens';
import { EventUpdated } from '../event-events';

export type UpdateEventCommand = {
  eventId: string;
  title?: string;
  body?: string;
  kind?: shared.EventKind;
  date?: string;
  location?: shared.Address;
};

// todo: check is author
export class UpdateEvent implements CommandHandler<UpdateEventCommand> {
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
    private readonly eventPublisher: EventPublisher,
    private readonly htmlParser: HtmlParserPort,
  ) {}

  async handle(command: UpdateEventCommand): Promise<void> {
    const now = this.dateAdapter.now();

    await this.database.db
      .update(schema.events)
      .set({
        title: command.title,
        text: command.body ? this.htmlParser.getTextContent(command.body) : undefined,
        html: command.body,
        date: command.date ? new Date(command.date) : undefined,
        location: command.location,
        kind: command.kind,
        updatedAt: now,
      })
      .where(eq(schema.events.id, command.eventId));

    this.eventPublisher.publish(new EventUpdated(command.eventId));
  }
}
