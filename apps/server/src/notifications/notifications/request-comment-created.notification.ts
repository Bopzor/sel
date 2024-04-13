import { NotificationData } from '@sel/shared';

import { EmailKind, EmailVariables } from '../../infrastructure/email/email.types';
import { TranslationPort } from '../../infrastructure/translation/translation.port';
import { Member } from '../../members/member.entity';

import { NotificationCreator } from './notification-creator';

export class RequestCommentCreatedNotification implements NotificationCreator {
  constructor(
    private readonly translation: TranslationPort,
    private readonly data: NotificationData['RequestCommentCreated'],
  ) {}

  shouldSend(member: Member) {
    return member.id !== this.data.comment.author.id;
  }

  title(member: Member) {
    return this.translation.translate('requestCommentCreated.title', {
      title: this.data.request.title,
      isRequester: this.data.request.requester.id === member.id,
    });
  }

  titleTrimmed(member: Member) {
    return this.translation.notificationTitle('requestCommentCreated.title', 'title', {
      title: this.data.request.title,
      isRequester: this.data.request.requester.id === member.id,
    });
  }

  content() {
    return this.translation.translate('requestCommentCreated.content', {
      author: this.translation.memberName(this.data.comment.author),
      message: this.data.comment.message,
    });
  }

  emailKind(): EmailKind {
    return 'requestCommentCreated';
  }

  emailVariables({ firstName }: Member): EmailVariables['requestCommentCreated'] {
    return { firstName, ...this.data };
  }
}
