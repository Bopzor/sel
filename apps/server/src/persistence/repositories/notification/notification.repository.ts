import * as shared from '@sel/shared';

import { NotificationDeliveryType } from '../../../common/notification-delivery-type';
import { Notification } from '../../../notifications/notification.entity';

export type InsertNotificationModel = {
  id: string;
  subscriptionId: string;
  entityId?: string;
  type: shared.NotificationType;
  date: Date;
  deliveryType: Record<NotificationDeliveryType, boolean>;
  title: string;
  push: {
    title: string;
    content: string;
    link: string;
  };
  email: {
    subject: string;
    text: string;
    html: string;
  };
};

export interface NotificationRepository {
  query_countNotificationsForMember(memberId: string, read?: boolean): Promise<number>;
  query_getNotificationsForMember(memberId: string): Promise<Array<shared.Notification>>;

  insertAll(models: Array<InsertNotificationModel>): Promise<void>;
  getNotification(notificationId: string): Promise<Notification | undefined>;
  getNotificationsForMember(memberId: string): Promise<Array<Notification>>;
  markAsRead(notificationId: string): Promise<void>;
}
