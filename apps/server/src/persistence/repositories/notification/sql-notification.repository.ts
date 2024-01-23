import * as shared from '@sel/shared';
import { injectableClass } from 'ditox';
import { SQL, and, count, desc, eq, isNotNull, isNull } from 'drizzle-orm';

import { DatePort } from '../../../infrastructure/date/date.port';
import { Notification } from '../../../notifications/entities';
import { TOKENS } from '../../../tokens';
import { Database } from '../../database';
import { notifications, subscriptions } from '../../schema';


import { InsertNotificationModel, NotificationRepository } from './notification.repository';

export class SqlNotificationRepository implements NotificationRepository {
  static inject = injectableClass(this, TOKENS.database, TOKENS.date);

  constructor(private readonly database: Database, private readonly dateAdapter: DatePort) {}

  async query_countNotificationsForMember(memberId: string, read?: boolean): Promise<number> {
    let where: SQL<unknown> | undefined = eq(subscriptions.memberId, memberId);

    if (read !== undefined) {
      where = and(where, read ? isNotNull(notifications.readAt) : isNull(notifications.readAt));
    }

    const result = await this.database.db
      .select({ value: count() })
      .from(notifications)
      .innerJoin(subscriptions, eq(notifications.subscriptionId, subscriptions.id))
      .where(where);

    return result[0].value;
  }

  async query_getNotificationsForMember(memberId: string): Promise<Array<shared.Notification>> {
    const sqlNotifications = await this.database.db
      .select()
      .from(notifications)
      .innerJoin(subscriptions, eq(notifications.subscriptionId, subscriptions.id))
      .where(eq(subscriptions.memberId, memberId))
      .orderBy(desc(notifications.date));

    return sqlNotifications.map(
      ({ notifications }): shared.Notification => ({
        id: notifications.id,
        type: notifications.type as shared.NotificationType,
        date: notifications.date.toISOString(),
        read: notifications.readAt !== null,
        title: notifications.title,
        content: notifications.content,
        data: notifications.data as shared.Notification['data'],
      })
    );
  }

  async getNotification(notificationId: string): Promise<Notification | undefined> {
    const [result] = await this.database.db
      .select()
      .from(notifications)
      .innerJoin(subscriptions, eq(notifications.subscriptionId, subscriptions.id))
      .where(eq(notifications.id, notificationId));

    if (!result) {
      return undefined;
    }

    return this.toNotification(result.subscriptions, result.notifications);
  }

  async getNotificationsForMember(memberId: string): Promise<Notification[]> {
    const sqlNotifications = await this.database.db
      .select()
      .from(notifications)
      .innerJoin(subscriptions, eq(notifications.subscriptionId, subscriptions.id))
      .where(eq(subscriptions.memberId, memberId));

    return sqlNotifications.map(({ notifications, subscriptions }) =>
      this.toNotification(subscriptions, notifications)
    );
  }

  private toNotification(
    this: void,
    sqlSubscription: typeof subscriptions.$inferSelect,
    sqlNotification: typeof notifications.$inferSelect
  ): Notification {
    return {
      id: sqlNotification.id,
      subscriptionId: sqlSubscription.id,
      type: sqlNotification.type as shared.NotificationType,
      memberId: sqlSubscription.memberId,
      date: sqlNotification.date,
      content: sqlNotification.content,
      title: sqlNotification.title,
      data: sqlNotification.data,
    };
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
        type: model.type,
        date: model.date,
        title: model.title,
        content: model.content,
        data: model.data,
        createdAt: now,
        updatedAt: now,
      }))
    );
  }

  async markAsRead(notificationId: string): Promise<void> {
    const now = this.dateAdapter.now();

    await this.database.db
      .update(notifications)
      .set({ readAt: now })
      .where(eq(notifications.id, notificationId));
  }
}
