import { InMemoryRepository } from '../in-memory.repository';

import { Notification } from './entities';
import { InsertNotificationModel, NotificationRepository } from './notification.repository';

export class InMemoryNotificationRepository
  extends InMemoryRepository<Notification>
  implements NotificationRepository
{
  getNotificationsForMember(memberId: string): Promise<Notification[]> {
    throw new Error('Method not implemented.');
  }

  async insertAll(models: InsertNotificationModel[]): Promise<void> {
    models.forEach((model) => this.add({ id: model.id }));
  }
}
