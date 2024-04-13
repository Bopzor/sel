import { NotificationData } from '@sel/shared';

import { EmailKind, EmailVariables } from '../../infrastructure/email/email.types';
import { TranslationPort } from '../../infrastructure/translation/translation.port';
import { Member } from '../../members/member.entity';

import { NotificationCreator } from './notification-creator';

export class EventParticipationSetNotification implements NotificationCreator {
  constructor(
    private readonly translation: TranslationPort,
    private readonly data: NotificationData['EventParticipationSet'],
  ) {}

  shouldSend(member: Member) {
    if (member.id !== this.data.event.organizer.id) {
      return false;
    }

    return this.data.participation === 'yes' || this.data.previousParticipation === 'yes';
  }

  title() {
    const participant = this.translation.memberName(this.data.participant);

    if (this.data.participation === 'yes') {
      return this.translation.translate('eventParticipationAdded.title', { participant });
    } else {
      return this.translation.translate('eventParticipationRemoved.title', { participant });
    }
  }

  titleTrimmed() {
    const participant = this.translation.memberName(this.data.participant);

    if (this.data.participation === 'yes') {
      return this.translation.notificationTitle('eventParticipationAdded.title', 'participant', {
        participant,
      });
    } else {
      return this.translation.notificationTitle('eventParticipationRemoved.title', 'participant', {
        participant,
      });
    }
  }

  content() {
    return this.data.event.title;
  }

  emailKind(): EmailKind {
    return 'eventParticipationSet';
  }

  emailVariables({ firstName }: Member): EmailVariables['eventParticipationSet'] {
    return { firstName, ...this.data };
  }
}
