import { IntlShape, createIntl, createIntlCache } from '@formatjs/intl';
import { assert } from '@sel/utils';
import { JSX, createContext, createMemo, useContext } from 'solid-js';

import { Language } from './types';

const intlContext = createContext<IntlShape>();

export const useIntl = () => {
  const intl = useContext(intlContext);

  assert(intl, 'Missing IntlProvider');

  return intl;
};

type IntlProviderProps = {
  locale: Language;
  messages: Record<string, string>;
  children: JSX.Element;
};

export const IntlProvider = (props: IntlProviderProps) => {
  const intl = createMemo<IntlShape>(() => {
    const cache = createIntlCache();

    return createIntl(
      {
        locale: props.locale,
        messages: props.messages,
      },
      cache
    );
  });

  return <intlContext.Provider value={intl()}>{props.children}</intlContext.Provider>;
};
