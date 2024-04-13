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
    return this.translation.translate('eventCreated.title');
  }

  titleTrimmed() {
    return this.translation.translate('eventCreated.title');
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
