export type InsertNotificationModel = {
  id: string;
  subscriptionId: string;
  eventId?: string;
  date: Date;
  title: string;
  content: string;
};

export interface NotificationRepository {
  insert(model: InsertNotificationModel): Promise<void>;
}
