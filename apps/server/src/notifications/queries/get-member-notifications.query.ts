import * as shared from '@sel/shared';
import { injectableClass } from 'ditox';

import { NotificationRepository } from '../../persistence/repositories/notification/notification.repository';
import { TOKENS } from '../../tokens';

export type GetMemberNotificationQuery = {
  memberId: string;
};

export type GetMemberNotificationQueryResult = {
  unreadCount: number;
  notifications: shared.Notification[];
};

export class GetMemberNotifications {
  static inject = injectableClass(this, TOKENS.notificationRepository);

  constructor(private readonly notificationRepository: NotificationRepository) {}

  async handle({ memberId }: GetMemberNotificationQuery): Promise<GetMemberNotificationQueryResult> {
    const unreadCount = await this.notificationRepository.query_countNotificationsForMember(memberId, false);
    const notifications = await this.notificationRepository.query_getNotificationsForMember(memberId);

    return {
      unreadCount,
      notifications,
    };
  }
}
