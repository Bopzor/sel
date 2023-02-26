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
  return useTranslation(ns).t;
};

type TProps = {
  ns: Namespace;
  children: string;
};

export const T = ({ ns, children }: TProps) => {
  const t = useTranslate(ns);
  return <>{t(children)}</>;
};
