import { injectableClass } from 'ditox';

import { CommandBus } from '../../infrastructure/cqs/command-bus';
import { EventHandler } from '../../infrastructure/cqs/event-handler';
import { COMMANDS, TOKENS } from '../../tokens';
import { MemberCreated } from '../member-events';

export class CreateMemberSubscription implements EventHandler<MemberCreated> {
  static inject = injectableClass(this, TOKENS.commandBus);

  constructor(private readonly commandBus: CommandBus) {}

  async handle(event: MemberCreated) {
    const memberId = event.entityId;

    await this.commandBus.executeCommand(COMMANDS.createSubscription, {
      type: 'NewAppVersion',
      memberId,
      active: false,
    });

    await this.commandBus.executeCommand(COMMANDS.createSubscription, {
      type: 'RequestCreated',
      memberId,
      active: false,
    });
  }
}
