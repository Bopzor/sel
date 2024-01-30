import { NotificationType, NotificationData } from '@sel/shared';

import { EmailKind, EmailVariables } from '../../infrastructure/email/email.types';
import { TranslationPort } from '../../infrastructure/translation/translation.port';
import { Member } from '../../members/member.entity';
import { SubscriptionEntityType } from '../subscription.entity';

import { NewAppVersionNotification } from './new-app-version.notification';
import { RequestCommentCreatedNotification } from './request-comment-created.notification';
import { RequestCreatedNotification } from './request-created.notification';

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
  data: unknown
): NotificationCreator {
  switch (type) {
    case 'NewAppVersion':
      return new NewAppVersionNotification(translation, data as NotificationData['NewAppVersion']);

    case 'RequestCreated':
      return new RequestCreatedNotification(translation, data as NotificationData['RequestCreated']);

    case 'RequestCommentCreated':
      return new RequestCommentCreatedNotification(
        translation,
        data as NotificationData['RequestCommentCreated']
      );

    default:
      throw new Error(`Unknown notification type "${type}"`);
  }
}
