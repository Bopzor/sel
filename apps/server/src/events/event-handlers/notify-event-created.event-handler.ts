import { NotificationData } from '@sel/shared';
import { assert } from '@sel/utils';
import { injectableClass } from 'ditox';
import { eq } from 'drizzle-orm';

import { CommandBus } from '../../infrastructure/cqs/command-bus';
import { EventHandler } from '../../infrastructure/cqs/event-handler';
import { Database } from '../../persistence/database';
import { events } from '../../persistence/schema';
import { COMMANDS, TOKENS } from '../../tokens';
import { EventCreated } from '../event-events';

export class NotifyEventCreated implements EventHandler<EventCreated> {
  static inject = injectableClass(this, TOKENS.commandBus, TOKENS.database);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly database: Database,
  ) {}

  async handle({ entityId: eventId }: EventCreated): Promise<void> {
    const event = await this.database.db.query.events.findFirst({
      where: eq(events.id, eventId),
      with: { organizer: true },
    });

    assert(event);

    await this.commandBus.executeCommand(COMMANDS.notify, {
      subscriptionType: 'EventCreated',
      notificationType: 'EventCreated',
      data: {
        event: {
          id: event.id,
          title: event.title,
          organizer: {
            id: event.organizer.id,
            firstName: event.organizer.firstName,
            lastName: event.organizer.lastName,
          },
          message: event.text,
        },
      } satisfies NotificationData['EventCreated'],
    });
  }
}
