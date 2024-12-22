import { JSX } from 'solid-js';

import { Flatten } from 'src/utils/types';

import { useIntl } from './intl-provider';
import translations from './lang/fr.json';

export const createTranslate = createTranslationHelper<keyof Flatten<typeof translations>>({
  nbsp: () => <>&nbsp;</>,
  br: () => <br />,
  em: (children) => <em>{children}</em>,
  strong: (children) => <strong class="font-semibold">{children}</strong>,
});

type Prefixes<Key extends string> = Key extends `${infer P}.${infer S}` ? P | `${P}.${Prefixes<S>}` : never;
type Values = Record<string, Date | JSX.Element | ((children: JSX.Element) => JSX.Element)>;

export function createTranslationHelper<Key extends string>(commonValues: Values = {}) {
  function createTranslate<Prefix extends Prefixes<Key>>(prefix: Prefix) {
    const intl = useIntl();

    type Suffix = Key extends `${Prefix}.${infer S}` ? S : never;

    function translate(suffix: Suffix): string;
    function translate(suffix: Suffix, values: Values): JSX.Element;

    function translate(suffix: string, values?: Values) {
      return intl.formatMessage({ id: `${prefix}.${suffix}` }, { ...values, ...commonValues });
    }

    return translate;
  }

  return function <Prefix extends Prefixes<Key>>(prefix: Prefix) {
    type Suffix = Key extends `${Prefix}.${infer S}` ? S : never;

    function Translate(props: { id: Suffix; values?: Values }) {
      const translate = createTranslate(prefix);
      return <>{translate(props.id, props.values ?? {})}</>;
    }

    Translate.useTranslate = () => createTranslate(prefix);

    return Translate;
  };
}
