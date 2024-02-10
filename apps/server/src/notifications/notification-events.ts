import { NotificationDeliveryType } from '../common/notification-delivery-type';
import { DomainEvent } from '../domain-event';

class NotificationEvent extends DomainEvent {
  entity = 'notification';
}

export class NotificationCreated extends NotificationEvent {}

export class NotificationDelivered extends NotificationEvent {
  constructor(
    notificationId: string,
    public readonly deliveryType: NotificationDeliveryType,
  ) {
    super(notificationId);
  }
}

export class NotificationDeliveryFailed extends NotificationEvent {
  constructor(
    notificationId: string,
    public readonly deliveryType: NotificationDeliveryType,
    public readonly error: unknown,
  ) {
    super(notificationId);
  }
}
