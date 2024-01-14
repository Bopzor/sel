import * as shared from '@sel/shared';

import { InMemoryRepository } from '../in-memory.repository';
import { DatePort } from '../infrastructure/date/date.port';

import { Notification } from './entities';
import { InsertNotificationModel, NotificationRepository } from './notification.repository';

export class InMemoryNotificationRepository
  extends InMemoryRepository<Notification>
  implements NotificationRepository
{
  constructor(private readonly dateAdapter: DatePort) {
    super();
  }

  query_getNotificationsForMember(): Promise<shared.Notification[]> {
    throw new Error('Method not implemented.');
  }

  getNotificationsForMember(): Promise<Notification[]> {
    throw new Error('Method not implemented.');
  }

  async getNotification(notificationId: string): Promise<Notification | undefined> {
    return this.get(notificationId);
  }

  async insertAll(models: InsertNotificationModel[]): Promise<void> {
    models.forEach((model) => this.add({ memberId: '', ...model }));
  }

  async markAsRead(notificationId: string): Promise<void> {
    const notification = this.get(notificationId);

    if (notification) {
      notification.readAt = this.dateAdapter.now();
      this.add(notification);
    }
  }
}
