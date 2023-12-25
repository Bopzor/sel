import { IntlProvider as SolidIntlProvider } from '@cookbook/solid-intl';
import { JSX, createResource, createSignal } from 'solid-js';

import fr from './lang/fr.json';
import { Language } from './types';

type IntlProviderProps = {
  children: JSX.Element;
};

export const IntlProvider = (props: IntlProviderProps) => {
  const [language] = createSignal<Language>('fr');

  const [translations] = createResource(language, getTranslations, {
    initialValue: flattenTranslations(fr),
  });

  return (
    <SolidIntlProvider locale={language()} messages={translations()}>
      {props.children}
    </SolidIntlProvider>
  );
};

async function getTranslations(language: Language): Promise<Record<string, string>> {
  return flattenTranslations(await fetchTranslations(language));
}

async function fetchTranslations(locale: Language) {
  switch (locale) {
    case 'fr':
      return fr;

    case 'en':
      return import('./lang/en.json').then((mod) => mod.default);
  }
}

export function flattenTranslations(obj: object, prefix = '') {
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      result[`${prefix !== '' ? `${prefix}.` : ''}${key}`] = value;
    } else if (typeof value === 'object' && value !== null) {
      Object.assign(result, flattenTranslations(value as object, `${prefix}.${key}`.replace(/^\./, '')));
    } else {
      throw new Error(`Cannot flatten value of type "${typeof value}"`);
    }
  }

  return result;
}
