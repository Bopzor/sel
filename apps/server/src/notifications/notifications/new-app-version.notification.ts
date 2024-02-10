import { NotificationData } from '@sel/shared';

import { EmailKind, EmailVariables } from '../../infrastructure/email/email.types';
import { TranslationPort } from '../../infrastructure/translation/translation.port';
import { Member } from '../../members/member.entity';

import { NotificationCreator } from './notification-creator';

export class NewAppVersionNotification implements NotificationCreator {
  constructor(
    private readonly translation: TranslationPort,
    private readonly data: NotificationData['NewAppVersion'],
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

  emailKind(): EmailKind {
    return 'newAppVersion';
  }

  emailVariables({ firstName }: Member): EmailVariables['newAppVersion'] {
    return {
      firstName,
      version: this.data.version,
    };
  }
}
