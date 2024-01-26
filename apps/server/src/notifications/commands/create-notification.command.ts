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
  NotificationRepository,
  InsertNotificationModel,
} from '../../persistence/repositories/notification/notification.repository';
import {
  SubscriptionEntityType,
  SubscriptionRepository,
} from '../../persistence/repositories/subscription/subscription.repository';
import { TOKENS } from '../../tokens';
import { NotificationCreated } from '../notification-events';
import { Notification } from '../notification.entity';
import { NewAppVersionNotification } from '../notifications/new-app-version.notification';
import { NotificationCreator } from '../notifications/notification-creator';
import { RequestCommentCreatedNotification } from '../notifications/request-comment-created.notification';
import { RequestCreatedNotification } from '../notifications/request-created.notification';
import { SubscriptionType } from '../subscription.entity';

export type CreateNotificationCommand = {
  subscriptionType: SubscriptionType;
  notificationType: NotificationType;
  entity?: {
    type: SubscriptionEntityType;
    id: string;
  };
  data: NotificationData[NotificationType];
};

export class CreateNotification implements CommandHandler<CreateNotificationCommand> {
  static inject = injectableClass(
    this,
    TOKENS.generator,
    TOKENS.date,
    TOKENS.translation,
    TOKENS.eventPublisher,
    TOKENS.memberRepository,
    TOKENS.subscriptionRepository,
    TOKENS.notificationRepository
  );

  constructor(
    private readonly generator: GeneratorPort,
    private readonly dateAdapter: DatePort,
    private readonly translation: TranslationPort,
    private readonly eventPublisher: EventPublisherPort,
    private readonly memberRepository: MemberRepository,
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly notificationRepository: NotificationRepository
  ) {}

  async handle({ subscriptionType, notificationType, data }: CreateNotificationCommand): Promise<void> {
    const now = this.dateAdapter.now();

    const subscriptions = await this.subscriptionRepository.getSubscriptionsByType(subscriptionType);
    const notifications = new Array<InsertNotificationModel>();

    const members = await this.memberRepository.getMembers(
      subscriptions.map((subscription) => subscription.memberId)
    );

    for (const subscription of subscriptions) {
      const member = defined(members.find(hasId(subscription.memberId)));
      const creator = this.getCreator(notificationType, data);

      if (!subscription.active || !creator.shouldSend(member.id)) {
        continue;
      }

      const notification: Notification = {
        id: this.generator.id(),
        subscriptionId: subscription.id,
        memberId: member.id,
        type: notificationType,
        date: now,
        deliveryType: member.notificationDeliveryType,
        title: creator.title(),
        titleTrimmed: creator.titleTrimmed(),
        content: creator.content(),
        data,
      };

      notifications.push(notification);
      this.eventPublisher.publish(new NotificationCreated(notification.id));
    }

    await this.notificationRepository.insertAll(notifications);
  }

  getCreator(type: NotificationType, data: NotificationData[NotificationType]): NotificationCreator {
    switch (type) {
      case 'NewAppVersion':
        return new NewAppVersionNotification(this.translation, data as NotificationData['NewAppVersion']);

      case 'RequestCreated':
        return new RequestCreatedNotification(this.translation, data as NotificationData['RequestCreated']);

      case 'RequestCommentCreated':
        return new RequestCommentCreatedNotification(
          this.translation,
          data as NotificationData['RequestCommentCreated']
        );

      default:
        throw new Error(`Unknown notification type "${type}"`);
    }
  }
}
