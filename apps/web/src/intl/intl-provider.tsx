import { IntlShape as BaseIntlShape, createIntl, createIntlCache } from '@formatjs/intl';
import { defined } from '@sel/utils';
import { createContext, JSX, JSXElement, useContext } from 'solid-js';

import { flatten } from 'src/utils/flatten';

import translations from './lang/fr.json';

const intlContext = createContext<BaseIntlShape<JSXElement>>();

export function IntlProvider(props: { children: JSX.Element }) {
  const cache = createIntlCache();
  const intl = createIntl<JSXElement>({ locale: 'fr', messages: flatten(translations) }, cache);

  return <intlContext.Provider value={intl}>{props.children}</intlContext.Provider>;
}

export function useIntl() {
  return defined(useContext(intlContext));
}
