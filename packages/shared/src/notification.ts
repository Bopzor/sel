import { RequestStatus } from './request';

const notificationTypes = [
  'NewAppVersion',
  'RequestCreated',
  'RequestCommentCreated',
  'RequestStatusChanged',
] as const;

export type NotificationType = (typeof notificationTypes)[number];

export function isNotificationType(type: string): type is NotificationType {
  return notificationTypes.includes(type as NotificationType);
}

export function isNotificationOfType<Type extends NotificationType>(
  notification: Notification,
  type: Type,
): notification is Notification<Type> {
  return notification.type === type;
}

export type Notification<Type extends NotificationType = NotificationType> = {
  id: string;
  type: Type;
  date: string;
  read: boolean;
  title: string;
  content: string;
  data: NotificationData[Type];
};

export type NotificationData = {
  NewAppVersion: {
    version: string;
    content?: string;
  };

  RequestCreated: {
    request: {
      id: string;
      title: string;
      requester: {
        id: string;
        firstName: string;
        lastName: string;
      };
      message: string;
    };
  };

  RequestCommentCreated: {
    request: {
      id: string;
      title: string;
      requester: {
        id: string;
        firstName: string;
        lastName: string;
      };
    };
    comment: {
      id: string;
      message: string;
      author: {
        id: string;
        firstName: string;
        lastName: string;
      };
    };
  };

  RequestStatusChanged: {
    request: {
      id: string;
      title: string;
      status: RequestStatus;
      requester: {
        id: string;
        firstName: string;
        lastName: string;
      };
    };
  };
};
