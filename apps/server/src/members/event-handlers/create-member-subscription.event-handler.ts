import { injectableClass } from 'ditox';

import { SubscriptionService } from '../../notifications/subscription.service';
import { TOKENS } from '../../tokens';
import { MemberCreated } from '../member-events';

export class CreateMemberSubscription {
  static inject = injectableClass(this, TOKENS.subscriptionService);

  constructor(private readonly subscriptionService: SubscriptionService) {}

  async handle(event: MemberCreated) {
    await this.subscriptionService.createSubscription('NewAppVersion', event.entityId);
    await this.subscriptionService.createSubscription('RequestCreated', event.entityId);
  }
}
