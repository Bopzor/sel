import { NotificationData } from '@sel/shared';

import { TranslationPort } from '../../infrastructure/translation/translation.port';
import { SubscriptionEntity } from '../subscription.entity';

import { NotificationCreator } from './notification-creator';

export class RequestCommentCreatedNotification implements NotificationCreator {
  constructor(
    private readonly translation: TranslationPort,
    private readonly data: NotificationData['RequestCommentCreated']
  ) {}

  entity(): SubscriptionEntity {
    return {
      type: 'request',
      id: this.data.request.id,
    };
  }

  shouldSend(memberId: string) {
    return memberId !== this.data.comment.author.id;
  }

  title() {
    return this.translation.translate('requestCommentCreated.title', {
      title: this.data.request.title,
    });
  }

  titleTrimmed() {
    return this.translation.notificationTitle('requestCommentCreated.title', 'title', {
      title: this.data.request.title,
    });
  }

  content() {
    return this.translation.translate('requestCommentCreated.content', {
      author: this.translation.memberName(this.data.comment.author),
      message: this.data.comment.message,
    });
  }
}
