import * as shared from '@sel/shared';
import { defined, hasId } from '@sel/utils';
import { injectableClass } from 'ditox';

import { DatePort } from '../infrastructure/date/date.port';
import { GeneratorPort } from '../infrastructure/generator/generator.port';
import { Member } from '../members/entities';
import { MembersFacade } from '../members/members.facade';
import { TOKENS } from '../tokens';

import { InsertNotificationModel, NotificationRepository } from './notification.repository';
import { SubscriptionType, SubscriptionRepository } from './subscription.repository';

export type NotificationPayload<Type extends shared.NotificationType> = {
  title: string;
  content: string;
  data: shared.NotificationData[Type];
};

export type ShouldSendNotification = (member: Member) => boolean;

export type GetNotificationPayload<Type extends shared.NotificationType> = (
  member: Member
) => NotificationPayload<Type>;

export class SubscriptionService {
  static inject = injectableClass(
    this,
    TOKENS.generator,
    TOKENS.date,
    TOKENS.membersFacade,
    TOKENS.subscriptionRepository,
    TOKENS.notificationRepository
  );

  constructor(
    private readonly generator: GeneratorPort,
    private readonly dateAdapter: DatePort,
    private readonly membersFacade: MembersFacade,
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly notificationRepository: NotificationRepository
  ) {}

  async createSubscription(type: SubscriptionType, memberId: string): Promise<void> {
    await this.subscriptionRepository.insert({
      id: this.generator.id(),
      type,
      memberId,
    });
  }

  async notify<Type extends shared.NotificationType>(
    type: Type,
    shouldSendNotification: ShouldSendNotification,
    getPayload: GetNotificationPayload<Type>
  ): Promise<void> {
    const now = this.dateAdapter.now();

    const subscriptions = await this.subscriptionRepository.getSubscriptionsForEventType(type);
    const notifications = new Array<InsertNotificationModel>();

    const members = await this.membersFacade.getMembers(
      subscriptions.map((subscription) => subscription.memberId)
    );

    for (const subscription of subscriptions) {
      const member = defined(members.find(hasId(subscription.memberId)));

      if (!shouldSendNotification(member)) {
        continue;
      }

      notifications.push({
        id: this.generator.id(),
        subscriptionId: subscription.id,
        date: now,
        ...getPayload(member),
      });
    }

    await this.notificationRepository.insertAll(notifications);
  }
}
