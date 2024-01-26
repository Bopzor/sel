import * as shared from '@sel/shared';

import { Notification } from '../../../notifications/notification.entity';

export type InsertNotificationModel = {
  id: string;
  subscriptionId: string;
  eventId?: string;
  type: shared.NotificationType;
  date: Date;
  title: string;
  titleTrimmed: string;
  content: string;
  data: unknown;
};

export interface NotificationRepository {
  query_countNotificationsForMember(memberId: string, read?: boolean): Promise<number>;
  query_getNotificationsForMember(memberId: string): Promise<Array<shared.Notification>>;

  insertAll(models: InsertNotificationModel[]): Promise<void>;
  getNotification(notificationId: string): Promise<Notification | undefined>;
  getNotificationsForMember(memberId: string): Promise<Array<Notification>>;
  markAsRead(notificationId: string): Promise<void>;
}
