import { EventBus } from '@sel/cqs';
import { NotificationType } from '@sel/shared';
import { defined, hasId } from '@sel/utils';
import { injectableClass } from 'ditox';

import { DatePort } from '../infrastructure/date/date.port';
import { GeneratorPort } from '../infrastructure/generator/generator.port';
import { Member } from '../members/member.entity';
import { MemberRepository } from '../persistence/repositories/member/member.repository';
import {
  InsertNotificationModel,
  NotificationRepository,
} from '../persistence/repositories/notification/notification.repository';
import { SubscriptionRepository } from '../persistence/repositories/subscription/subscription.repository';
import * as schema from '../persistence/schema';
import { TOKENS } from '../tokens';

import { NotificationCreated } from './notification-events';
import { SubscriptionType } from './subscription.entity';

type Notification = typeof schema.notifications.$inferSelect;

export type NotificationCreator = {
  subscriptionType: string;
  subscriptionEntityId?: string;
  notificationType: string;
  notificationEntityId?: string;
  data: (member: Member) => {
    shouldSend: boolean;
    title: string;
    push: Notification['push'];
    email: Notification['email'];
  };
};

export class SubscriptionService {
  static inject = injectableClass(
    this,
    TOKENS.generator,
    TOKENS.date,
    TOKENS.eventBus,
    TOKENS.memberRepository,
    TOKENS.subscriptionRepository,
    TOKENS.notificationRepository,
  );

  constructor(
    private readonly generator: GeneratorPort,
    private readonly dateAdapter: DatePort,
    private readonly eventBus: EventBus,
    private readonly memberRepository: MemberRepository,
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async notify(creator: NotificationCreator): Promise<void> {
    const now = this.dateAdapter.now();

    const subscriptions = await this.subscriptionRepository.getSubscriptions({
      type: creator.subscriptionType as SubscriptionType,
      entityId: creator.subscriptionEntityId,
    });

    const notifications = new Array<InsertNotificationModel>();

    const members = await this.memberRepository.getMembers(
      subscriptions.map((subscription) => subscription.memberId),
    );

    for (const subscription of subscriptions) {
      const member = defined(members.find(hasId(subscription.memberId)));
      const data = creator.data(member);

      if (!subscription.active || !data.shouldSend) {
        continue;
      }

      const notification: InsertNotificationModel = {
        id: this.generator.id(),
        subscriptionId: subscription.id,
        type: creator.notificationType as NotificationType,
        date: now,
        deliveryType: member.notificationDelivery,
        title: data.title,
        push: data.push,
        email: data.email,
      };

      notifications.push(notification);
    }

    await this.notificationRepository.insertAll(notifications);

    notifications.forEach((notification) => {
      this.eventBus.emit(new NotificationCreated(notification.id));
    });
  }
}
