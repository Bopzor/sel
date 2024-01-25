import { IntlShape, createIntl, createIntlCache } from '@formatjs/intl';
import { injectableClass } from 'ditox';

import { Member } from '../../members/entities';

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
      createIntlCache()
    );
  }

  translate(key: keyof typeof fr, values?: Record<string, string | number>): string {
    return this.intl.formatMessage({ id: key }, values);
  }

  emailSubject(key: keyof typeof fr, values?: Record<string, string | number>): string {
    return this.translate('emailSubject', {
      prefix: this.translate('emailSubjectPrefix'),
      subject: this.translate(key, values),
    });
  }

  memberName(member: Pick<Member, 'firstName' | 'lastName'>): string {
    return this.translate('memberName', {
      firstName: member.firstName,
      lastNameFirstLetter: member.lastName[0],
    });
  }
}
