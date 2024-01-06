import { injectableClass } from 'ditox';

import { DatePort } from '../infrastructure/date/date.port';
import { GeneratorPort } from '../infrastructure/generator/generator.port';
import { TOKENS } from '../tokens';

import { InsertNotificationModel, NotificationRepository } from './notification.repository';
import { SubscriptionEventType, SubscriptionRepository } from './subscription.repository';

export class SubscriptionService {
  static inject = injectableClass(
    this,
    TOKENS.generator,
    TOKENS.date,
    TOKENS.subscriptionRepository,
    TOKENS.notificationRepository
  );

  constructor(
    private readonly generator: GeneratorPort,
    private readonly dateAdapter: DatePort,
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly notificationRepository: NotificationRepository
  ) {}

  async createSubscription(eventType: SubscriptionEventType, memberId: string): Promise<void> {
    await this.subscriptionRepository.insert({
      id: this.generator.id(),
      eventType,
      memberId,
    });
  }

  async notify(eventType: SubscriptionEventType): Promise<void> {
    const now = this.dateAdapter.now();

    const subscriptions = await this.subscriptionRepository.getSubscriptionsForEventType(eventType);
    const notifications = new Array<InsertNotificationModel>();

    for (const subscription of subscriptions) {
      notifications.push({
        id: this.generator.id(),
        subscriptionId: subscription.id,
        date: now,
        ...this.getNotificationPayload(eventType),
      });
    }

    await this.notificationRepository.insertAll(notifications);
  }

  private getNotificationPayload(eventType: SubscriptionEventType): { title: string; content: string } {
    if (eventType === 'NewAppVersion') {
      return {
        title: "Nouvelle version de l'app",
        content: "Une nouvelle version de l'app est disponible.",
      };
    }

    throw new Error(`Unknown event type "${eventType}"`);
  }
}
