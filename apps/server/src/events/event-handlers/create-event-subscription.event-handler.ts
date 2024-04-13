import { injectableClass } from 'ditox';

import { CommandBus } from '../../infrastructure/cqs/command-bus';
import { EventHandler } from '../../infrastructure/cqs/event-handler';
import { COMMANDS, TOKENS } from '../../tokens';
import { EventCommentCreated, EventCreated, EventParticipationSet } from '../event-events';

export class CreateEventSubscription
  implements EventHandler<EventCreated | EventParticipationSet | EventCommentCreated>
{
  static inject = injectableClass(this, TOKENS.commandBus);

  constructor(private readonly commandBus: CommandBus) {}

  async handle(event: EventCreated | EventParticipationSet | EventCommentCreated): Promise<void> {
    await this.commandBus.executeCommand(COMMANDS.createSubscription, {
      type: 'EventEvent',
      memberId: this.memberId(event),
      entityId: event.entityId,
    });
  }

  private memberId(event: EventCreated | EventParticipationSet | EventCommentCreated): string {
    if (event instanceof EventCreated) {
      return event.organizerId;
    }

    if (event instanceof EventParticipationSet) {
      return event.participantId;
    }

    return event.authorId;
  }
}
