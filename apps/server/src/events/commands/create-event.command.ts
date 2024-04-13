import * as shared from '@sel/shared';
import { injectableClass } from 'ditox';

import { CommandHandler } from '../../infrastructure/cqs/command-handler';
import { DatePort } from '../../infrastructure/date/date.port';
import { EventPublisher } from '../../infrastructure/events/event-publisher';
import { HtmlParserPort } from '../../infrastructure/html-parser/html-parser.port';
import { Database } from '../../persistence/database';
import * as schema from '../../persistence/schema';
import { TOKENS } from '../../tokens';
import { EventCreated } from '../event-events';

export type CreateEventCommand = {
  eventId: string;
  organizerId: string;
  title: string;
  body: string;
  kind: shared.EventKind;
  date?: string;
  location?: shared.Address;
};

export class CreateEvent implements CommandHandler<CreateEventCommand> {
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

  async handle(command: CreateEventCommand): Promise<void> {
    const { eventId, organizerId, title, body, kind, date, location } = command;
    const now = this.dateAdapter.now();

    await this.database.db.insert(schema.events).values({
      id: eventId,
      organizerId: organizerId,
      title: title,
      text: this.htmlParser.getTextContent(body),
      html: body,
      date: date ? new Date(date) : undefined,
      location: location,
      kind: kind,
      createdAt: now,
      updatedAt: now,
    });

    this.eventPublisher.publish(new EventCreated(eventId, organizerId));
  }
}
