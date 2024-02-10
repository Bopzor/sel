import { NotificationData } from '@sel/shared';

import { EmailKind, EmailVariables } from '../../infrastructure/email/email.types';
import { TranslationPort } from '../../infrastructure/translation/translation.port';
import { Member } from '../../members/member.entity';

import { NotificationCreator } from './notification-creator';

export class RequestCreatedNotification implements NotificationCreator {
  constructor(
    private readonly translation: TranslationPort,
    private readonly data: NotificationData['RequestCreated'],
  ) {}

  shouldSend(memberId: string) {
    return memberId !== this.data.request.requester.id;
  }

  title() {
    return this.translation.translate('requestCreated.title', {
      requester: this.translation.memberName(this.data.request.requester),
    });
  }

  titleTrimmed() {
    return this.translation.notificationTitle('requestCreated.title', 'requester', {
      requester: this.translation.memberName(this.data.request.requester),
    });
  }

  content() {
    return this.data.request.title;
  }

  emailKind(): EmailKind {
    return 'requestCreated';
  }

  emailVariables({ firstName }: Member): EmailVariables['requestCreated'] {
    return { firstName, ...this.data };
  }
}
