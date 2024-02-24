import { IntlShape, createIntl, createIntlCache } from '@formatjs/intl';
import { injectableClass } from 'ditox';

import { Member } from '../../members/member.entity';

import fr from './lang/fr.json';
import { TranslationPort } from './translation.port';

export class FormatJsTranslationAdapter implements TranslationPort {
  static inject = injectableClass(this);

  private intl: IntlShape;

  constructor() {
    this.intl = createIntl(
      {
        locale: 'fr-FR',
        messages: fr,
      },
      createIntlCache(),
    );
  }

  translate(key: string, values?: Record<string, string | number | boolean>): string {
    return this.intl.formatMessage({ id: key }, values);
  }

  memberName(member: Pick<Member, 'firstName' | 'lastName'>): string {
    return this.translate('memberName', {
      firstName: member.firstName,
      lastNameFirstLetter: member.lastName[0],
    });
  }

  notificationTitle(key: string, trimmableKey: string, values: Record<string, string | number | boolean>) {
    const length = this.translate(key, { ...values, [trimmableKey]: '' }).length;
    const maxLength = 65 - length;

    let trimmableValue = String(values[trimmableKey]);

    if (trimmableValue.length > maxLength) {
      trimmableValue = trimmableValue.substring(0, maxLength - 1) + '…';
    }

    return this.translate(key, {
      ...values,
      [trimmableKey]: trimmableValue,
    });
  }
}
