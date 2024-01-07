import * as shared from '@sel/shared';
import { injectableClass } from 'ditox';
import { desc, eq } from 'drizzle-orm';

import { DatePort } from '../infrastructure/date/date.port';
import { Database } from '../infrastructure/persistence/database';
import { notifications, subscriptions } from '../infrastructure/persistence/schema';
import { TOKENS } from '../tokens';

import { Notification } from './entities';
import { InsertNotificationModel, NotificationRepository } from './notification.repository';
import { SubscriptionType } from './subscription.repository';

export class SqlNotificationRepository implements NotificationRepository {
  static inject = injectableClass(this, TOKENS.database, TOKENS.date);

  constructor(private readonly database: Database, private readonly dateAdapter: DatePort) {}

  async query_getNotificationsForMember(memberId: string): Promise<Array<shared.Notification>> {
    const sqlNotifications = await this.database.db
      .select()
      .from(notifications)
      .innerJoin(subscriptions, eq(notifications.subscriptionId, subscriptions.id))
      .where(eq(subscriptions.memberId, memberId))
      .orderBy(desc(notifications.date));

    return sqlNotifications.map(
      ({ notifications, subscriptions }): shared.Notification => ({
        id: notifications.id,
        type: subscriptions.type as SubscriptionType,
        date: notifications.date.toISOString(),
        read: notifications.readAt !== null,
        title: notifications.title,
        content: notifications.content,
        data: notifications.data as shared.Notification['data'],
      })
    );
  }

  async getNotificationsForMember(memberId: string): Promise<Notification[]> {
    const sqlNotifications = await this.database.db
      .select()
      .from(notifications)
      .innerJoin(subscriptions, eq(notifications.subscriptionId, subscriptions.id))
      .where(eq(subscriptions.memberId, memberId));

    return sqlNotifications.map(({ notifications, subscriptions }) => ({
      id: notifications.id,
      subscriptionId: subscriptions.id,
      date: notifications.date,
      content: notifications.content,
      title: notifications.title,
      data: notifications.data,
    }));
  }

  async insertAll(models: InsertNotificationModel[]): Promise<void> {
    if (models.length === 0) {
      return;
    }

    const now = this.dateAdapter.now();

    await this.database.db.insert(notifications).values(
      models.map((model) => ({
        id: model.id,
        subscriptionId: model.subscriptionId,
        date: model.date,
        title: model.title,
        content: model.content,
        data: model.data,
        createdAt: now,
        updatedAt: now,
      }))
    );
  }
}
