import { type schema } from 'src/persistence';

export enum NotificationDeliveryType {
  email = 'email',
  push = 'push',
}

export type Notification = typeof schema.notifications.$inferSelect;
export type NotificationInsert = typeof schema.notifications.$inferInsert;

export type NotificationDelivery = typeof schema.notificationDeliveries.$inferSelect;
export type NotificationDeliveryInsert = typeof schema.notificationDeliveries.$inferInsert;
