import { NotificationData } from '@sel/shared';
import { assert } from '@sel/utils';
import { injectableClass } from 'ditox';
import { eq } from 'drizzle-orm';

import { CommandBus } from '../../infrastructure/cqs/command-bus';
import { EventHandler } from '../../infrastructure/cqs/event-handler';
import { Database } from '../../persistence/database';
import { events, members } from '../../persistence/schema';
import { COMMANDS, TOKENS } from '../../tokens';
import { EventParticipationSet } from '../event-events';

export class NotifyEventParticipationSet implements EventHandler<EventParticipationSet> {
  static inject = injectableClass(this, TOKENS.commandBus, TOKENS.database);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly database: Database,
  ) {}

  async handle({
    entityId: eventId,
    participantId,
    previousParticipation,
    participation,
  }: EventParticipationSet): Promise<void> {
    const event = await this.database.db.query.events.findFirst({
      where: eq(events.id, eventId),
      with: { organizer: true },
    });

    assert(event);

    const participant = await this.database.db.query.members.findFirst({
      where: eq(members.id, participantId),
    });

    assert(participant);

    await this.commandBus.executeCommand(COMMANDS.notify, {
      subscriptionType: 'EventEvent',
      notificationType: 'EventParticipationSet',
      data: {
        event: {
          id: event.id,
          title: event.title,
          organizer: {
            id: event.organizer.id,
          },
        },
        participant: {
          id: participant.id,
          firstName: participant.firstName,
          lastName: participant.lastName,
        },
        previousParticipation,
        participation,
      } satisfies NotificationData['EventParticipationSet'],
    });
  }
}
