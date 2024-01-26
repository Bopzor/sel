import * as shared from '@sel/shared';
import { defined, hasId } from '@sel/utils';
import { injectableClass } from 'ditox';

import { DatePort } from '../infrastructure/date/date.port';
import { EventPublisherPort } from '../infrastructure/events/event-publisher.port';
import { GeneratorPort } from '../infrastructure/generator/generator.port';
import { Member } from '../members/member.entity';
import { MemberRepository } from '../persistence/repositories/member/member.repository';
import {
  InsertNotificationModel,
  NotificationRepository,
} from '../persistence/repositories/notification/notification.repository';
import { SubscriptionRepository } from '../persistence/repositories/subscription/subscription.repository';
import { TOKENS } from '../tokens';

import { NotificationCreated } from './notification-events';
import { SubscriptionType } from './subscription.entity';

export type NotificationPayload<Type extends shared.NotificationType> = {
  type: Type;
  title: string;
  titleTrimmed: string;
  content: string;
  data: shared.NotificationData[Type];
};

export type ShouldSendNotification = (member: Member) => boolean;
export type GetNotificationPayload = (member: Member) => NotificationPayload<shared.NotificationType>;

export class SubscriptionService {
  static inject = injectableClass(
    this,
    TOKENS.generator,
    TOKENS.date,
    TOKENS.eventPublisher,
    TOKENS.memberRepository,
    TOKENS.subscriptionRepository,
    TOKENS.notificationRepository
  );

  constructor(
    private readonly generator: GeneratorPort,
    private readonly dateAdapter: DatePort,
    private readonly eventPublisher: EventPublisherPort,
    private readonly memberRepository: MemberRepository,
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly notificationRepository: NotificationRepository
  ) {}

  async notify(
    type: SubscriptionType,
    shouldSendNotification: ShouldSendNotification,
    getPayload: GetNotificationPayload
  ): Promise<void> {
    const now = this.dateAdapter.now();

    const subscriptions = await this.subscriptionRepository.getSubscriptionsByType(type);
    const notifications = new Array<InsertNotificationModel>();

    const members = await this.memberRepository.getMembers(
      subscriptions.map((subscription) => subscription.memberId)
    );

    for (const subscription of subscriptions) {
      const member = defined(members.find(hasId(subscription.memberId)));

      if (!subscription.active || !shouldSendNotification(member)) {
        continue;
      }

      const notification = {
        id: this.generator.id(),
        subscriptionId: subscription.id,
        date: now,
        deliveryType: member.notificationDeliveryType,
        ...getPayload(member),
      };

      notifications.push(notification);
    }

    await this.notificationRepository.insertAll(notifications);

    for (const notification of notifications) {
      this.eventPublisher.publish(new NotificationCreated(notification.id));
    }
  }
}
