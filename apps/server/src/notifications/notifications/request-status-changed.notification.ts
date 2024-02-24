import { NotificationData } from '@sel/shared';

import { EmailKind, EmailVariables } from '../../infrastructure/email/email.types';
import { TranslationPort } from '../../infrastructure/translation/translation.port';
import { Member } from '../../members/member.entity';
import { SubscriptionEntity } from '../subscription.entity';

import { NotificationCreator } from './notification-creator';

export class RequestStatusChangedNotification implements NotificationCreator {
  constructor(
    private readonly translation: TranslationPort,
    private readonly data: NotificationData['RequestStatusChanged'],
  ) {}

  entity(): SubscriptionEntity {
    return {
      type: 'request',
      id: this.data.request.id,
    };
  }

  shouldSend(member: Member) {
    return member.id !== this.data.request.requester.id;
  }

  title() {
    return this.translation.translate('requestStatusChanged.title', {
      requester: this.translation.memberName(this.data.request.requester),
    });
  }

  titleTrimmed() {
    return this.translation.notificationTitle('requestStatusChanged.title', 'requester', {
      requester: this.translation.memberName(this.data.request.requester),
    });
  }

  content() {
    return this.translation.translate('requestStatusChanged.content', {
      requester: this.translation.memberName(this.data.request.requester),
      title: this.data.request.title,
    });
  }

  emailKind(): EmailKind {
    return 'requestStatusChanged';
  }

  emailVariables({ firstName }: Member): EmailVariables['requestStatusChanged'] {
    return { firstName, ...this.data };
  }
}
