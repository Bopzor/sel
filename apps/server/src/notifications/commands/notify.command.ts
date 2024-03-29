import { NotificationData, NotificationType } from '@sel/shared';
import { defined, hasId } from '@sel/utils';
import { injectableClass } from 'ditox';

import { CommandHandler } from '../../infrastructure/cqs/command-handler';
import { DatePort } from '../../infrastructure/date/date.port';
import { EventPublisherPort } from '../../infrastructure/events/event-publisher.port';
import { GeneratorPort } from '../../infrastructure/generator/generator.port';
import { TranslationPort } from '../../infrastructure/translation/translation.port';
import { MemberRepository } from '../../persistence/repositories/member/member.repository';
import {
  InsertNotificationModel,
  NotificationRepository,
} from '../../persistence/repositories/notification/notification.repository';
import { SubscriptionRepository } from '../../persistence/repositories/subscription/subscription.repository';
import { TOKENS } from '../../tokens';
import { NotificationCreated } from '../notification-events';
import { Notification } from '../notification.entity';
import { getNotificationCreator } from '../notifications/notification-creator';
import { SubscriptionEntity, SubscriptionType } from '../subscription.entity';

export type NotifyCommand = {
  subscriptionType: SubscriptionType;
  notificationType: NotificationType;
  entity?: SubscriptionEntity;
  data: NotificationData[NotificationType];
};

export class Notify implements CommandHandler<NotifyCommand> {
  static inject = injectableClass(
    this,
    TOKENS.generator,
    TOKENS.date,
    TOKENS.translation,
    TOKENS.eventPublisher,
    TOKENS.memberRepository,
    TOKENS.subscriptionRepository,
    TOKENS.notificationRepository,
  );

  constructor(
    private readonly generator: GeneratorPort,
    private readonly dateAdapter: DatePort,
    private readonly translation: TranslationPort,
    private readonly eventPublisher: EventPublisherPort,
    private readonly memberRepository: MemberRepository,
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async handle({ subscriptionType, notificationType, data }: NotifyCommand): Promise<void> {
    const now = this.dateAdapter.now();
    const creator = getNotificationCreator(this.translation, notificationType, data);

    const subscriptions = await this.subscriptionRepository.getSubscriptions({
      type: subscriptionType,
      entity: creator.entity?.(),
    });

    const notifications = new Array<InsertNotificationModel>();

    const members = await this.memberRepository.getMembers(
      subscriptions.map((subscription) => subscription.memberId),
    );

    for (const subscription of subscriptions) {
      const member = defined(members.find(hasId(subscription.memberId)));

      if (!subscription.active || !creator.shouldSend(member)) {
        continue;
      }

      const notification: Notification = {
        id: this.generator.id(),
        subscriptionId: subscription.id,
        memberId: member.id,
        type: notificationType,
        date: now,
        deliveryType: member.notificationDelivery,
        title: creator.title(member),
        titleTrimmed: creator.titleTrimmed(member),
        content: creator.content(member),
        data,
      };

      notifications.push(notification);
      this.eventPublisher.publish(new NotificationCreated(notification.id));
    }

    await this.notificationRepository.insertAll(notifications);
  }
}
