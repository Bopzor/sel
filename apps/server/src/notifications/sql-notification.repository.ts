import { injectableClass } from 'ditox';
import { eq } from 'drizzle-orm';

import { DatePort } from '../infrastructure/date/date.port';
import { Database } from '../infrastructure/persistence/database';
import { notifications, subscriptions } from '../infrastructure/persistence/schema';
import { TOKENS } from '../tokens';

import { Notification } from './entities';
import { InsertNotificationModel, NotificationRepository } from './notification.repository';

export class SqlNotificationRepository implements NotificationRepository {
  static inject = injectableClass(this, TOKENS.database, TOKENS.date);

  constructor(private readonly database: Database, private readonly dateAdapter: DatePort) {}

  async getNotificationsForMember(memberId: string): Promise<Notification[]> {
    const sqlNotifications = await this.database.db
      .select()
      .from(notifications)
      .innerJoin(subscriptions, eq(notifications.subscriptionId, subscriptions.id))
      .where(eq(subscriptions.memberId, memberId));

    return sqlNotifications.map(({ notifications, subscriptions }) => ({
      id: notifications.id,
      subscriptionId: subscriptions.id,
      content: notifications.content,
      title: notifications.title,
      date: notifications.date,
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
        createdAt: now,
        updatedAt: now,
      }))
    );
  }
}
