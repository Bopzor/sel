import { assert, hasId, negate } from '@sel/utils';
import { injectableClass } from 'ditox';

import { EventHandler } from '../../infrastructure/cqs/event-handler';
import { TranslationPort } from '../../infrastructure/translation/translation.port';
import { SubscriptionService } from '../../notifications/subscription.service';
import { MemberRepository } from '../../persistence/repositories/member/member.repository';
import { RequestRepository } from '../../persistence/repositories/request/request.repository';
import { TOKENS } from '../../tokens';
import { RequestCreated } from '../request-events';

export class NotifyRequestCreated implements EventHandler<RequestCreated> {
  static inject = injectableClass(
    this,
    TOKENS.translation,
    TOKENS.memberRepository,
    TOKENS.requestRepository,
    TOKENS.subscriptionService
  );

  constructor(
    private readonly translation: TranslationPort,
    private readonly memberRepository: MemberRepository,
    private readonly requestRepository: RequestRepository,
    private readonly subscriptionService: SubscriptionService
  ) {}

  async handle(event: RequestCreated): Promise<void> {
    const request = await this.requestRepository.getRequest(event.entityId);
    assert(request);

    const requester = await this.memberRepository.getMember(request?.requesterId);
    assert(requester);

    await this.subscriptionService.notify(
      //
      'RequestCreated',
      negate(hasId(requester.id)),
      () => ({
        type: 'RequestCreated',
        title: this.translation.translate('requestCreated.title', {
          requester: this.translation.memberName(requester),
        }),
        titleTrimmed: this.translation.notificationTitle('requestCreated.title', 'requester', {
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
