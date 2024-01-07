import { assert } from '@sel/utils';
import { injectableClass } from 'ditox';

import { MembersFacade } from '../members/members.facade';
import { SubscriptionFacade } from '../notifications/subscription.facade';
import { TOKENS } from '../tokens';

import { RequestCreated } from './events';
import { RequestRepository } from './request.repository';

export class RequestNotificationsService {
  static inject = injectableClass(
    this,
    TOKENS.subscriptionFacade,
    TOKENS.membersFacade,
    TOKENS.requestRepository
  );

  constructor(
    private readonly subscriptionFacade: SubscriptionFacade,
    private readonly memberFacade: MembersFacade,
    private readonly requestRepository: RequestRepository
  ) {}

  async onRequestCreated(event: RequestCreated): Promise<void> {
    const request = await this.requestRepository.getRequest(event.entityId);
    assert(request);

    const requester = await this.memberFacade.getMember(request?.requesterId);
    assert(requester);

    await this.subscriptionFacade.notify('RequestCreated', () => ({
      title: `Nouvelle demande de ${requester.firstName} ${requester.lastName[0]}.`,
      content: request.title,
    }));
  }
}
