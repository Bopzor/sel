import { NotificationType } from '@sel/shared';
import { ClassType } from '@sel/utils';

import { EmailKind, EmailVariables } from '../../infrastructure/email/email.types';
import { TranslationPort } from '../../infrastructure/translation/translation.port';
import { Member } from '../../members/member.entity';
import { SubscriptionEntityType } from '../subscription.entity';

import { NewAppVersionNotification } from './new-app-version.notification';
import { RequestCommentCreatedNotification } from './request-comment-created.notification';
import { RequestCreatedNotification } from './request-created.notification';
import { RequestStatusChangedNotification } from './request-status-changed.notification';

export interface NotificationCreator {
  entity?(): { type: SubscriptionEntityType; id: string };
  shouldSend(memberId: string): boolean;
  title(): string;
  titleTrimmed(): string;
  content(): string;
  emailKind(): EmailKind;
  emailVariables(member: Member): EmailVariables[EmailKind];
}

export function getNotificationCreator(
  translation: TranslationPort,
  type: NotificationType,
  data: unknown,
): NotificationCreator {
  const NotificationCreator = notificationCreators[type];

  return new NotificationCreator(translation, data);
}

const notificationCreators: Record<
  NotificationType,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ClassType<NotificationCreator, [TranslationPort, any]>
> = {
  NewAppVersion: NewAppVersionNotification,
  RequestCreated: RequestCreatedNotification,
  RequestCommentCreated: RequestCommentCreatedNotification,
  RequestStatusChanged: RequestStatusChangedNotification,
};
