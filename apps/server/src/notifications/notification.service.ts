import { injectableClass } from 'ditox';

import { NotificationRepository } from '../persistence/repositories/notification/notification.repository';
import { TOKENS } from '../tokens';

import { MemberIsNotNotificationRecipient, NotificationNotFound } from './errors';

export class NotificationService {
  static inject = injectableClass(this, TOKENS.notificationRepository);

  constructor(private readonly notificationRepository: NotificationRepository) {}

  async markAsRead(notificationId: string, memberId: string): Promise<void> {
    const notification = await this.notificationRepository.getNotification(notificationId);

    if (!notification) {
      throw new NotificationNotFound(notificationId);
    }

    if (notification.memberId !== memberId) {
      throw new MemberIsNotNotificationRecipient(notificationId);
    }

    await this.notificationRepository.markAsRead(notificationId);
  }
}
