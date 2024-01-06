import { injectableClass } from 'ditox';

import { DatePort } from '../infrastructure/date/date.port';
import { GeneratorPort } from '../infrastructure/generator/generator.port';
import { TOKENS } from '../tokens';

import { InsertNotificationModel, NotificationRepository } from './notification.repository';
import { SubscriptionType, SubscriptionRepository } from './subscription.repository';

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

  async createSubscription(type: SubscriptionType, memberId: string): Promise<void> {
    await this.subscriptionRepository.insert({
      id: this.generator.id(),
      type,
      memberId,
    });
  }

  async notify(type: SubscriptionType): Promise<void> {
    const now = this.dateAdapter.now();

    const subscriptions = await this.subscriptionRepository.getSubscriptionsForEventType(type);
    const notifications = new Array<InsertNotificationModel>();

    for (const subscription of subscriptions) {
      notifications.push({
        id: this.generator.id(),
        subscriptionId: subscription.id,
        date: now,
        ...this.getNotificationPayload(type),
      });
    }

    await this.notificationRepository.insertAll(notifications);
  }

  private getNotificationPayload(type: SubscriptionType): { title: string; content: string } {
    if (type === 'NewAppVersion') {
      return {
        title: "Nouvelle version de l'app",
        content: "Une nouvelle version de l'app est disponible.",
      };
    }

    throw new Error(`Unknown subscription type "${type}"`);
  }
}
