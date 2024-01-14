import * as shared from '@sel/shared';
import { injectableClass } from 'ditox';

import { TOKENS } from '../tokens';

import { NotificationRepository } from './notification.repository';
import { NotificationService } from './notification.service';
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

  markNotificationAsRead(notificationId: string, memberId: string): Promise<void>;

  createSubscription(type: SubscriptionType, memberId: string, active?: boolean): Promise<void>;

  notify<Type extends SubscriptionType>(
    type: Type,
    shouldSendNotification: ShouldSendNotification,
    getPayload: GetNotificationPayload<Type>
  ): Promise<void>;
}

export class SubscriptionFacadeImpl implements SubscriptionFacade {
  static inject = injectableClass(
    this,
    TOKENS.subscriptionService,
    TOKENS.notificationService,
    TOKENS.notificationRepository
  );

  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly notificationService: NotificationService,
    private readonly notificationRepository: NotificationRepository
  ) {}

  query_getNotifications(memberId: string): Promise<shared.Notification[]> {
    return this.notificationRepository.query_getNotificationsForMember(memberId);
  }

  async markNotificationAsRead(notificationId: string, memberId: string): Promise<void> {
    await this.notificationService.markAsRead(notificationId, memberId);
  }

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
  query_getNotifications(): Promise<shared.Notification[]> {
    throw new Error('Method not implemented.');
  }

  markNotificationAsRead(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  createSubscription(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  notify(): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
