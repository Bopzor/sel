import { injectableClass } from 'ditox';

import { TOKENS } from '../tokens';

import { MemberIsNotNotificationRecipient, NotificationNotFound } from './errors';
import { NotificationRepository } from './notification.repository';

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
