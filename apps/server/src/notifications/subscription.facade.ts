import { injectableClass } from 'ditox';

import { TOKENS } from '../tokens';

import { SubscriptionType } from './entities';
import { SubscriptionEntityType } from './subscription.repository';
import {
  GetNotificationPayload,
  NotificationPayload,
  ShouldSendNotification,
  SubscriptionService,
} from './subscription.service';

export type { NotificationPayload };

export interface SubscriptionFacade {
  createSubscription(
    type: SubscriptionType,
    memberId: string,
    entity?: { type: SubscriptionEntityType; id: string },
    active?: boolean
  ): Promise<void>;

  notify(
    type: SubscriptionType,
    shouldSendNotification: ShouldSendNotification,
    getPayload: GetNotificationPayload
  ): Promise<void>;
}

export class SubscriptionFacadeImpl implements SubscriptionFacade {
  static inject = injectableClass(this, TOKENS.subscriptionService);

  constructor(private readonly subscriptionService: SubscriptionService) {}

  async createSubscription(
    type: SubscriptionType,
    memberId: string,
    entity?: { type: SubscriptionEntityType; id: string },
    active?: boolean
  ): Promise<void> {
    await this.subscriptionService.createSubscription(type, memberId, entity, active);
  }

  async notify(
    type: SubscriptionType,
    shouldSendNotification: ShouldSendNotification,
    getPayload: GetNotificationPayload
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
