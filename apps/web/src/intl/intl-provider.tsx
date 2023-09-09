import { IntlShape } from '@formatjs/intl';
import { assert } from '@sel/utils';
import { createContext, useContext, Show, ParentProps, createSignal, onMount } from 'solid-js';

import { createIntlInstance } from './intl';

const intlContext = createContext<IntlShape>();

export const IntlProvider = intlContext.Provider;

export const useIntl = () => {
  const intl = useContext(intlContext);

  assert(intl, 'Missing IntlProvider');

  return intl;
};

type TranslationsProviderProps = ParentProps;

export const TranslationsProvider = (props: TranslationsProviderProps) => {
  const [intl, setIntl] = createSignal<IntlShape>();

  onMount(() => {
    void createIntlInstance('fr').then(setIntl);
  });

  return <Show when={intl()}>{(intl) => <IntlProvider value={intl()}>{props.children}</IntlProvider>}</Show>;
};
