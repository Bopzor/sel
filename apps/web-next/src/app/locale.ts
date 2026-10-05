import { i18n } from '@lingui/core';

import { messages as en } from 'src/locales/en.po';
import { messages as fr } from 'src/locales/fr.po';

const catalogs = { fr, en };

export type Locale = keyof typeof catalogs;

// Each language is named in itself, for a member to find theirs whatever the current language.
export const localeNames: Record<Locale, string> = {
  fr: 'Français',
  en: 'English',
};

const storageKey = 'locale';

export function getLocale(): Locale {
  const stored = localStorage.getItem(storageKey);

  if (!isLocale(stored)) {
    return 'fr';
  }

  return stored;
}

function isLocale(value: unknown): value is Locale {
  return Object.keys(catalogs).includes(value as string);
}

export function setLocale(locale: Locale) {
  localStorage.setItem(storageKey, locale);
  activateLocale(locale);
}

export function activateLocale(locale: Locale) {
  i18n.loadAndActivate({ locale, messages: catalogs[locale] });
  document.documentElement.lang = locale;
}
