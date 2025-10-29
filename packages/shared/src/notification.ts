import { z } from 'zod';

import { EventParticipation } from './event';
import { RequestAnswer, RequestStatus } from './request';

export const registerDeviceBodySchema = z.object({
  subscription: z.record(z.any(), z.any()),
  deviceType: z.union([z.literal('mobile'), z.literal('desktop')]),
});

const notificationTypes = [
  'Test',
  'NewAppVersion',
  'RequestCreated',
  'RequestCommentCreated',
  'RequestStatusChanged',
  'RequestAnswerSet',
  'EventCreated',
  'EventCommentCreated',
  'EventParticipationSet',
  'TransactionPending',
  'TransactionCompleted',
  'TransactionCanceled',
  'InformationPublished',
  'InformationCommentCreated',
  'NewsPublished',
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
  context: NotificationData[NotificationType];
};

export type NotificationData = {
  Test: {
    member: {
      firstName: string;
    };
    answer: number;
    content: {
      html: string;
      text: string;
    };
  };

  NewAppVersion: {
    member: {
      firstName: string;
    };
    version: string;
    content?: string;
  };

  RequestCreated: {
    member: {
      firstName: string;
    };
    request: {
      id: string;
      title: string;
      requester: {
        id: string;
        name: string;
      };
      body: {
        html: string;
        text: string;
      };
    };
  };

  RequestCommentCreated: {
    member: {
      firstName: string;
    };
    isRequester: boolean;
    request: {
      id: string;
      title: string;
      requester: {
        id: string;
        name: string;
      };
    };
    comment: {
      id: string;
      author: {
        id: string;
        name: string;
      };
      body: {
        html: string;
        text: string;
      };
    };
  };

  RequestStatusChanged: {
    member: {
      firstName: string;
    };
    request: {
      id: string;
      title: string;
      status: RequestStatus;
      requester: {
        id: string;
        name: string;
      };
    };
  };

  RequestAnswerSet: {
    member: {
      firstName: string;
    };
    request: {
      id: string;
      title: string;
      requester: {
        id: string;
      };
    };
    respondent: {
      id: string;
      name: string;
    };
    previousAnswer: RequestAnswer['answer'] | null;
    answer: RequestAnswer['answer'] | null;
  };

  EventCreated: {
    member: {
      firstName: string;
    };
    event: {
      id: string;
      title: string;
      organizer: {
        id: string;
        name: string;
      };
      body: {
        html: string;
        text: string;
      };
    };
  };

  EventParticipationSet: {
    member: {
      firstName: string;
    };
    event: {
      id: string;
      title: string;
      organizer: {
        id: string;
      };
    };
    participant: {
      id: string;
      name: string;
    };
    previousParticipation: EventParticipation | null;
    participation: EventParticipation | null;
  };

  EventCommentCreated: {
    member: {
      firstName: string;
    };
    isOrganizer: boolean;
    event: {
      id: string;
      title: string;
      organizer: {
        id: string;
        name: string;
      };
    };
    comment: {
      id: string;
      author: {
        id: string;
        name: string;
      };
      body: {
        html: string;
        text: string;
      };
    };
  };

  TransactionPending: {
    member: {
      firstName: string;
    };
    transaction: {
      id: string;
      description: string;
      recipient: {
        id: string;
        name: string;
      };
    };
    currency: string;
    currencyAmount: string;
  };

  TransactionCanceled: {
    member: {
      firstName: string;
    };
    transaction: {
      id: string;
      description: string;
      payer: {
        id: string;
        name: string;
      };
    };
    currency: string;
  };

  TransactionCompleted: {
    member: {
      firstName: string;
    };
    transaction: {
      id: string;
      description: string;
      payer: {
        id: string;
        name: string;
      };
      creatorId: string;
    };
    currencyAmount: string;
  };

  NewsPublished: {
    member: {
      firstName: string;
    };
    information: {
      id: string;
      letsName: string;
      body: {
        html: string;
        text: string;
      };
    };
  };

  InformationPublished: {
    member: {
      firstName: string;
    };
    information: {
      id: string;
      author: {
        id: string;
        name: string;
      };
      title: string;
      body: {
        html: string;
        text: string;
      };
    };
  };

  InformationCommentCreated: {
    member: {
      firstName: string;
    };
    isPublisher: boolean;
    information: {
      id: string;
      title: string;
      author?: {
        id: string;
        name: string;
      };
    };
    comment: {
      id: string;
      author: {
        id: string;
        name: string;
      };
      body: {
        html: string;
        text: string;
      };
    };
  };
};
