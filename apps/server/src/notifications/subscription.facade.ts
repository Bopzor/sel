import * as shared from '@sel/shared';
import { injectableClass } from 'ditox';

import { TOKENS } from '../tokens';

import { NotificationRepository } from './notification.repository';
import { SubscriptionType } from './subscription.repository';
import {
  GetNotificationPayload,
  NotificationPayload,
  ShouldSendNotification,
  SubscriptionService,
} from './subscription.service';

export type { NotificationPayload };

export interface SubscriptionFacade {
  query_getNotifications(memberId: string): Promise<shared.Notification[]>;

  createSubscription(type: SubscriptionType, memberId: string): Promise<void>;

  notify<Type extends SubscriptionType>(
    type: Type,
    shouldSendNotification: ShouldSendNotification,
    getPayload: GetNotificationPayload<Type>
  ): Promise<void>;
}

export class SubscriptionFacadeImpl implements SubscriptionFacade {
  static inject = injectableClass(this, TOKENS.subscriptionService, TOKENS.notificationRepository);

  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly notificationRepository: NotificationRepository
  ) {}

  query_getNotifications(memberId: string): Promise<shared.Notification[]> {
    return this.notificationRepository.query_getNotificationsForMember(memberId);
  }

  async createSubscription(type: SubscriptionType, memberId: string): Promise<void> {
    await this.subscriptionService.createSubscription(type, memberId);
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
  query_getNotifications(memberId: string): Promise<shared.Notification[]> {
    throw new Error('Method not implemented.');
  }

  createSubscription(type: SubscriptionType, memberId: string): Promise<void> {
    throw new Error('Method not implemented.');
  }

  notify(
    type: shared.NotificationType,
    shouldSendNotification: ShouldSendNotification,
    getPayload: GetNotificationPayload<shared.NotificationType>
  ): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
