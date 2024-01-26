import { NotificationData } from '@sel/shared';
import { assert } from '@sel/utils';
import { injectableClass } from 'ditox';

import { CommandBus } from '../../infrastructure/cqs/command-bus';
import { EventHandler } from '../../infrastructure/cqs/event-handler';
import { MemberRepository } from '../../persistence/repositories/member/member.repository';
import { RequestRepository } from '../../persistence/repositories/request/request.repository';
import { COMMANDS, TOKENS } from '../../tokens';
import { RequestCreated } from '../request-events';

export class NotifyRequestCreated implements EventHandler<RequestCreated> {
  static inject = injectableClass(this, TOKENS.commandBus, TOKENS.memberRepository, TOKENS.requestRepository);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly memberRepository: MemberRepository,
    private readonly requestRepository: RequestRepository
  ) {}

  async handle(event: RequestCreated): Promise<void> {
    const request = await this.requestRepository.getRequest(event.entityId);
    assert(request);

    const requester = await this.memberRepository.getMember(request?.requesterId);
    assert(requester);

    await this.commandBus.executeCommand(COMMANDS.createNotification, {
      subscriptionType: 'RequestCreated',
      notificationType: 'RequestCreated',
      data: {
        request: {
          id: request.id,
          title: request.title,
        },
        requester: {
          id: requester.id,
          firstName: requester.firstName,
          lastName: requester.lastName,
        },
      } satisfies NotificationData['RequestCreated'],
    });
  }
}
