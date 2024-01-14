import * as shared from '@sel/shared';

import { Notification } from './entities';

export type InsertNotificationModel = {
  id: string;
  subscriptionId: string;
  eventId?: string;
  date: Date;
  title: string;
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
