import { JSX } from 'solid-js';

import { Translations } from './intl';
import { useIntl } from './intl-provider';

type Paths<T, Prefix extends string = ''> = T extends string
  ? Prefix
  : {
      [Key in keyof T]: Key extends string
        ? Prefix extends ''
          ? Paths<T[Key], Key>
          : Prefix | Paths<T[Key], `${Prefix}.${Key}`>
        : never;
    }[keyof T];

type Leaves<T, Prefix extends string = ''> = T extends string
  ? Prefix
  : {
      [Key in keyof T]: Key extends string
        ? Prefix extends ''
          ? Leaves<T[Key], Key>
          : Leaves<T[Key], `${Prefix}.${Key}`>
        : never;
    }[keyof T];

type RemovePrefix<T extends string, P extends string> = T extends `${P}${infer R}` ? R : never;

interface TranslateFunction<Keys> {
  (id: Keys): string;
  (id: Keys, values: Record<string, JSX.Element>): JSX.Element;
}

export const useTranslation = () => {
  const intl = useIntl();

  const translate = (id: Leaves<Translations>, values?: Record<string, JSX.Element>) => {
    // @ts-expect-error JSX.Element works
    return intl.formatMessage({ id }, values);
  };

  return translate as TranslateFunction<Leaves<Translations>>;
};

type TranslateProps<Keys extends string> = {
  id: Keys;
  values?: Record<string, JSX.Element>;
};

export const Translate = (props: TranslateProps<Leaves<Translations>>) => {
  const translate = useTranslation();

  return <>{translate(props.id, props.values ?? {})}</>;
};

Translate.prefix = <Prefix extends Paths<Translations>>(prefix?: Prefix) => {
  const getId = (id: string) => {
    return `${prefix ? `${prefix}.` : ''}${id}` as Leaves<Translations>;
  };

  type Props = TranslateProps<RemovePrefix<Leaves<Translations>, `${Prefix}.`>>;

  const T = (props: Props) => {
    return <Translate id={getId(props.id)} values={props.values} />;
  };

  T.useTranslation = () => {
    const t = useTranslation();

    const translate = (id: Props['id'], values: Record<string, JSX.Element>) => {
      return t(getId(id), values);
    };

    return translate as TranslateFunction<Props['id']>;
  };

  return T;
};
