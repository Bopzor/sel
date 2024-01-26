import { NotificationData } from '@sel/shared';

import { TranslationPort } from '../../infrastructure/translation/translation.port';

import { NotificationCreator } from './notification-creator';

export class NewAppVersionNotification implements NotificationCreator {
  constructor(
    private readonly translation: TranslationPort,
    private readonly data: NotificationData['NewAppVersion']
  ) {}

  shouldSend() {
    return true;
  }

  title() {
    return this.translation.translate('newAppVersion.title');
  }

  titleTrimmed() {
    return this.translation.translate('newAppVersion.title');
  }

  content() {
    return this.data.content ?? this.translation.translate('newAppVersion.content');
  }
}
