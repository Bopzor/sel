import { assert, hasId, negate } from '@sel/utils';
import { injectableClass } from 'ditox';

import { TranslationPort } from '../infrastructure/translation/translation.port';
import { MembersFacade } from '../members/members.facade';
import { SubscriptionFacade } from '../notifications/subscription.facade';
import { TOKENS } from '../tokens';

import { RequestCreated } from './events';
import { RequestRepository } from './request.repository';

export class RequestNotificationsService {
  static inject = injectableClass(
    this,
    TOKENS.translation,
    TOKENS.subscriptionFacade,
    TOKENS.membersFacade,
    TOKENS.requestRepository
  );

  constructor(
    private readonly translation: TranslationPort,
    private readonly subscriptionFacade: SubscriptionFacade,
    private readonly memberFacade: MembersFacade,
    private readonly requestRepository: RequestRepository
  ) {}

  async onRequestCreated(event: RequestCreated): Promise<void> {
    const request = await this.requestRepository.getRequest(event.entityId);
    assert(request);

    const requester = await this.memberFacade.getMember(request?.requesterId);
    assert(requester);

    await this.subscriptionFacade.notify(
      //
      'RequestCreated',
      negate(hasId(requester.id)),
      () => ({
        title: this.translation.translate('requestCreated.title', {
          requester: this.translation.memberName(requester),
        }),
        content: request.title,
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
        },
      })
    );
  }
}
