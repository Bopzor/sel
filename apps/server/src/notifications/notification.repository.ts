import { Notification } from './entities';

export type InsertNotificationModel = {
  id: string;
  subscriptionId: string;
  eventId?: string;
  date: Date;
  title: string;
  content: string;
};

export interface NotificationRepository {
  insertAll(models: InsertNotificationModel[]): Promise<void>;
  getNotificationsForMember(memberId: string): Promise<Array<Notification>>;
}
