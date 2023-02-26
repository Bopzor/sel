import i18n from 'i18next';
import { initReactI18next, I18nextProvider, useTranslation } from 'react-i18next';

import en from './lang/en.json';
import fr from './lang/fr.json';

type Namespace = 'common' | 'layout' | 'home' | 'requests';

void i18n.use(initReactI18next).init({
  resources: { en, fr },
  lng: 'fr',
  interpolation: {
    escapeValue: false,
  },
});

type I18nProviderProps = {
  children: React.ReactNode;
};

export const I18nProvider = ({ children }: I18nProviderProps) => (
  <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
);

export const useTranslate = (ns: Namespace) => {
  const [t] = useTranslation(ns);

  return (key: string, args: Record<string, unknown> = {}) => t(key, args) ?? undefined;
};

type TranslationProps = {
  ns: Namespace;
  children: string;
};

export const Translation = ({ ns, children }: TranslationProps) => {
  const t = useTranslate(ns);

  return <>{t(children)}</>;
};

Translation.create = (ns: Namespace): React.ComponentType<Omit<TranslationProps, 'ns'>> => {
  return ({ children }) => <Translation ns={ns}>{children}</Translation>;
};
