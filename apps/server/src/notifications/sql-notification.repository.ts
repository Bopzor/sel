import { DatePort } from '../infrastructure/date/date.port';
import { Database } from '../infrastructure/persistence/database';
import { notifications } from '../infrastructure/persistence/schema';

import { InsertNotificationModel, NotificationRepository } from './notification.repository';

export class SqlNotificationRepository implements NotificationRepository {
  constructor(private readonly database: Database, private readonly dateAdapter: DatePort) {}

  async insert(model: InsertNotificationModel): Promise<void> {
    const now = this.dateAdapter.now();

    await this.database.db.insert(notifications).values({
      id: model.id,
      subscriptionId: model.subscriptionId,
      date: model.date,
      title: model.title,
      content: model.content,
      createdAt: now,
      updatedAt: now,
    });
  }
}
