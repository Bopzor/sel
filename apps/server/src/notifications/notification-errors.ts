import { DomainError, EntityNotFound } from '../domain-error';
import { HttpStatus } from '../http-status';

export class NotificationNotFound extends EntityNotFound {
  constructor(notificationId: string) {
    super('Notification not found', 'notification', notificationId);
  }
}

export class MemberIsNotNotificationRecipient extends DomainError<{ notificationId: string }> {
  status = HttpStatus.forbidden;

  constructor(notificationId: string) {
    super('Member is not the recipient of the notification', { notificationId });
  }
}
