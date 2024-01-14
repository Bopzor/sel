import { injectableClass } from 'ditox';

import { TOKENS } from '../tokens';

import { SubscriptionType } from './subscription.repository';
import {
  GetNotificationPayload,
  NotificationPayload,
  ShouldSendNotification,
  SubscriptionService,
} from './subscription.service';

export type { NotificationPayload };

export interface SubscriptionFacade {
  createSubscription(type: SubscriptionType, memberId: string, active?: boolean): Promise<void>;

  notify<Type extends SubscriptionType>(
    type: Type,
    shouldSendNotification: ShouldSendNotification,
    getPayload: GetNotificationPayload<Type>
  ): Promise<void>;
}

export class SubscriptionFacadeImpl implements SubscriptionFacade {
  static inject = injectableClass(this, TOKENS.subscriptionService);

  constructor(private readonly subscriptionService: SubscriptionService) {}

  async createSubscription(type: SubscriptionType, memberId: string, active?: boolean): Promise<void> {
    await this.subscriptionService.createSubscription(type, memberId, active);
  }

  async notify(
    type: SubscriptionType,
    shouldSendNotification: ShouldSendNotification,
    getPayload: GetNotificationPayload<SubscriptionType>
  ): Promise<void> {
    await this.subscriptionService.notify(type, shouldSendNotification, getPayload);
  }
}

export class StubSubscriptionFacade implements SubscriptionFacade {
  createSubscription(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  notify(): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
