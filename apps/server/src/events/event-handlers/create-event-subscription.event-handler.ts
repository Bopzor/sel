import { injectableClass } from 'ditox';

import { CommandBus } from '../../infrastructure/cqs/command-bus';
import { EventHandler } from '../../infrastructure/cqs/event-handler';
import { COMMANDS, TOKENS } from '../../tokens';
import { EventCommentCreated, EventCreated } from '../event-events';

export class CreateEventSubscription implements EventHandler<EventCreated | EventCommentCreated> {
  static inject = injectableClass(this, TOKENS.commandBus);

  constructor(private readonly commandBus: CommandBus) {}

  async handle(event: EventCreated | EventCommentCreated): Promise<void> {
    await this.commandBus.executeCommand(COMMANDS.createSubscription, {
      type: 'EventEvent',
      memberId: this.memberId(event),
      entity: { type: 'event', id: event.entityId },
    });
  }

  private memberId(event: EventCreated | EventCommentCreated): string {
    if (event instanceof EventCreated) {
      return event.organizerId;
    }

    return event.authorId;
  }
}
