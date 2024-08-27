import { EventParticipation } from './event';
import { RequestStatus } from './request';

const notificationTypes = [
  'Test',
  'NewAppVersion',
  'RequestCreated',
  'RequestCommentCreated',
  'RequestStatusChanged',
  'EventCreated',
  'EventCommentCreated',
  'EventParticipationSet',
  'TransactionPending',
  'TransactionCompleted',
  'TransactionCanceled',
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
  entityId?: string;
  date: string;
  read: boolean;
  title: string;
  content: string;
};

export type NotificationData = {
  Test: {
    member: {
      firstName: string;
    };
    link: string;
    answer: number;
    content: string;
  };

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

  EventCreated: {
    event: {
      id: string;
      title: string;
      organizer: {
        id: string;
        firstName: string;
        lastName: string;
      };
      message: string;
    };
  };

  EventParticipationSet: {
    event: {
      id: string;
      title: string;
      organizer: {
        id: string;
      };
    };
    participant: {
      id: string;
      firstName: string;
      lastName: string;
    };
    previousParticipation: EventParticipation | null;
    participation: EventParticipation | null;
  };

  EventCommentCreated: {
    event: {
      id: string;
      title: string;
      organizer: {
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

  TransactionCompleted: never;
  TransactionCanceled: never;
  TransactionPending: never;
};
