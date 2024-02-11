import { assert, getId } from '@sel/utils';
import { injectableClass } from 'ditox';

import { EventHandler } from '../../infrastructure/cqs/event-handler';
import { MemberRepository } from '../../persistence/repositories/member/member.repository';
import { SubscriptionRepository } from '../../persistence/repositories/subscription/subscription.repository';
import { TOKENS } from '../../tokens';
import { OnboardingCompleted } from '../member-events';

export class EnableSubscriptions implements EventHandler<OnboardingCompleted> {
  static inject = injectableClass(this, TOKENS.memberRepository, TOKENS.subscriptionRepository);

  constructor(
    private readonly memberRepository: MemberRepository,
    private readonly subscriptionRepository: SubscriptionRepository,
  ) {}

  async handle(event: OnboardingCompleted): Promise<void> {
    const member = await this.memberRepository.getMember(event.entityId);
    assert(member);

    const subscriptions = await this.subscriptionRepository.getSubscriptions({
      memberId: member.id,
    });

    await this.subscriptionRepository.enable(subscriptions.map(getId));
  }
}
