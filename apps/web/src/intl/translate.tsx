import { IntlShape, useIntl } from '@cookbook/solid-intl';
import { JSX } from 'solid-js';
import { Paths } from 'type-fest';

import { Translations } from './types';
import { zod } from './zod';

type PathsAsString<T> = Paths<T> extends string ? Paths<T> : never;
type RemovePrefix<T extends string, P extends string> = T extends `${P}${infer R}` ? R : never;

type LastPart<T extends string> = T extends `${string}.${infer Tail}` ? LastPart<Tail> : T;
type RemoveLastPart<T extends string> = T extends `${infer Head}.${LastPart<T>}` ? Head : '';
type NonLeavePaths<T extends string> = Exclude<RemoveLastPart<T>, ''>;

type LeavesFromPaths<P extends string> = {
  [K in P]: K extends NonLeavePaths<P> ? never : K;
}[P];

type Leaves<T> = LeavesFromPaths<PathsAsString<T>>;

type Values = Parameters<IntlShape['formatMessage']>[1];

interface TranslateFunction<Keys> {
  (id: Keys): string;
  (id: Keys, values: Values): JSX.Element;
}

export function useTranslation() {
  const intl = useIntl();

  const translate = (id: Leaves<Translations>, values?: Values) => {
    return intl.formatMessage({ id }, values);
  };

  return translate as TranslateFunction<Leaves<Translations>>;
}

type TranslateProps<Keys extends string> = {
  id: Keys;
  values?: Values;
};

export function Translate(props: TranslateProps<Leaves<Translations>>) {
  const translate = useTranslation();

  return <>{translate(props.id, props.values)}</>;
}

Translate.prefix = <Prefix extends NonLeavePaths<Paths<Translations>>>(prefix: Prefix) => {
  const getId = (id: string) => {
    return `${prefix}.${id}` as Leaves<Translations>;
  };

  type Keys = RemovePrefix<Leaves<Translations>, `${Prefix}.`>;
  type Props = TranslateProps<Keys>;

  const T = (props: Props) => {
    return <Translate id={getId(props.id)} values={props.values} />;
  };

  T.useTranslation = () => {
    const t = useTranslation();

    const translate = (id: Keys, values: Values) => {
      return t(getId(id), values);
    };

    return translate as TranslateFunction<Keys>;
  };

  return T;
};

Translate.enum = <Values extends string>(id: Paths<Translations>) => {
  type Props = {
    value: Values;
  };

  const T = (props: Props) => {
    return <Translate id={`${id}.${props.value}` as Leaves<Translations>} />;
  };

  return T;
};

Translate.zod = zod;
