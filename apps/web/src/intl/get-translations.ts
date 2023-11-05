import { flattenTranslations } from './flatten-translations';
import { Language } from './types';

export async function getTranslations(language: Language): Promise<Record<string, string>> {
  return flattenTranslations(await fetchTranslations(language));
}

async function fetchTranslations(locale: Language) {
  switch (locale) {
    case 'fr':
      return import('./lang/fr.json').then((mod) => mod.default);

    case 'en':
      return import('./lang/en.json').then((mod) => mod.default);
  }
}
