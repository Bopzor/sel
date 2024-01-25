import { injectableClass } from 'ditox';

import { NotificationRepository } from '../../persistence/repositories/notification/notification.repository';
import { TOKENS } from '../../tokens';
import { NotificationNotFound, MemberIsNotNotificationRecipient } from '../notification-errors';

export type MarkNotificationAsReadCommand = {
  notificationId: string;
  memberId: string;
};

export class MarkNotificationAsRead {
  static inject = injectableClass(this, TOKENS.notificationRepository);

  constructor(private readonly notificationRepository: NotificationRepository) {}

  async handle({ memberId, notificationId }: MarkNotificationAsReadCommand): Promise<void> {
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
