import { NotificationData } from '@sel/shared';

import { TranslationPort } from '../../infrastructure/translation/translation.port';

import { NotificationCreator } from './notification-creator';

export class RequestCreatedNotification implements NotificationCreator {
  constructor(
    private readonly translation: TranslationPort,
    private readonly data: NotificationData['RequestCreated']
  ) {}

  shouldSend(memberId: string) {
    return memberId !== this.data.requester.id;
  }

  title() {
    return this.translation.translate('requestCreated.title', {
      requester: this.translation.memberName(this.data.requester),
    });
  }

  titleTrimmed() {
    return this.translation.notificationTitle('requestCreated.title', 'requester', {
      requester: this.translation.memberName(this.data.requester),
    });
  }

  content() {
    return this.data.request.title;
  }
}
