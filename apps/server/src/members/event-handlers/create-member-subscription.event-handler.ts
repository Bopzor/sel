import { injectableClass } from 'ditox';

import { EventHandler } from '../../infrastructure/cqs/event-handler';
import { SubscriptionService } from '../../notifications/subscription.service';
import { TOKENS } from '../../tokens';
import { MemberCreated } from '../member-events';

export class CreateMemberSubscription implements EventHandler<MemberCreated> {
  static inject = injectableClass(this, TOKENS.subscriptionService);

  constructor(private readonly subscriptionService: SubscriptionService) {}

  async handle(event: MemberCreated) {
    await this.subscriptionService.createSubscription('NewAppVersion', event.entityId);
    await this.subscriptionService.createSubscription('RequestCreated', event.entityId);
  }
}
