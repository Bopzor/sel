import { NotificationData } from '@sel/shared';

import { EmailKind, EmailVariables } from '../../infrastructure/email/email.types';
import { TranslationPort } from '../../infrastructure/translation/translation.port';
import { Member } from '../../members/member.entity';

import { NotificationCreator } from './notification-creator';

export class EventCreatedNotification implements NotificationCreator {
  constructor(
    private readonly translation: TranslationPort,
    private readonly data: NotificationData['EventCreated'],
  ) {}

  shouldSend(member: Member) {
    return member.id !== this.data.event.organizer.id;
  }

  title() {
    return this.translation.translate('requestCreated.title', {
      organizer: this.translation.memberName(this.data.event.organizer),
    });
  }

  titleTrimmed() {
    return this.translation.notificationTitle('requestCreated.title', 'organizer', {
      requester: this.translation.memberName(this.data.event.organizer),
    });
  }

  content() {
    return this.data.event.title;
  }

  emailKind(): EmailKind {
    return 'eventCreated';
  }

  emailVariables({ firstName }: Member): EmailVariables['eventCreated'] {
    return { firstName, ...this.data };
  }
}
