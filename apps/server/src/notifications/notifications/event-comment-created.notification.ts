import { NotificationData } from '@sel/shared';

import { EmailKind, EmailVariables } from '../../infrastructure/email/email.types';
import { TranslationPort } from '../../infrastructure/translation/translation.port';
import { Member } from '../../members/member.entity';

import { NotificationCreator } from './notification-creator';

export class EventCommentCreatedNotification implements NotificationCreator {
  constructor(
    private readonly translation: TranslationPort,
    private readonly data: NotificationData['EventCommentCreated'],
  ) {}

  shouldSend(member: Member) {
    return member.id !== this.data.comment.author.id;
  }

  title(member: Member) {
    return this.translation.translate('eventCommentCreated.title', {
      title: this.data.event.title,
      isOrganizer: member.id === this.data.event.organizer.id,
    });
  }

  titleTrimmed(member: Member) {
    return this.translation.notificationTitle('eventCommentCreated.title', 'title', {
      title: this.data.event.title,
      isOrganizer: member.id === this.data.event.organizer.id,
    });
  }

  content() {
    return this.translation.translate('eventCommentCreated.content', {
      author: this.translation.memberName(this.data.comment.author),
      message: this.data.comment.message,
    });
  }

  emailKind(): EmailKind {
    return 'eventCommentCreated';
  }

  emailVariables({ firstName }: Member): EmailVariables['eventCommentCreated'] {
    return { firstName, ...this.data };
  }
}
