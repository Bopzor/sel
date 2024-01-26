import { injectableClass } from 'ditox';

import { CommandBus } from '../../infrastructure/cqs/command-bus';
import { EventHandler } from '../../infrastructure/cqs/event-handler';
import { COMMANDS, TOKENS } from '../../tokens';
import { RequestCommentCreated, RequestCreated } from '../request-events';

export class CreateRequestSubscription implements EventHandler<RequestCreated | RequestCommentCreated> {
  static inject = injectableClass(this, TOKENS.commandBus);

  constructor(private readonly commandBus: CommandBus) {}

  async handle(event: RequestCreated | RequestCommentCreated): Promise<void> {
    await this.commandBus.executeCommand(COMMANDS.createSubscription, {
      type: 'RequestEvent',
      memberId: this.memberId(event),
      entity: { type: 'request', id: event.entityId },
    });
  }

  private memberId(event: RequestCreated | RequestCommentCreated): string {
    if (event instanceof RequestCreated) {
      return event.requesterId;
    }

    return event.authorId;
  }
}
