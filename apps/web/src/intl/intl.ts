import { createIntl, createIntlCache } from '@formatjs/intl';

import { flattenTranslations } from './flatten-translations';
import type translations from './lang/en.json';

export type Locale = 'fr' | 'en';
export type Translations = typeof translations;

function loadTranslations(locale: Locale): Promise<Record<string, unknown>> {
  switch (locale) {
    case 'fr':
      return import('./lang/fr.json').then((module) => module.default);
    default:
      return import('./lang/en.json').then((module) => module.default);
  }
}

export async function createIntlInstance(locale: Locale) {
  const translations = await loadTranslations(locale);

  const cache = createIntlCache();

  return createIntl(
    {
      locale,
      messages: flattenTranslations(translations) as Record<string, string>,
    },
    cache
  );
}
