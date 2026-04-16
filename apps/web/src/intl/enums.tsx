import { useIntl } from './intl-provider';
import translations from './lang/fr.json';

type Enum = keyof (typeof translations)['enums'];
type EnumValue<E extends Enum> = Extract<keyof (typeof translations)['enums'][E], string>;

export function useTranslateEnum() {
  const intl = useIntl();

  return <E extends Enum>(enumName: E, value: EnumValue<E>) => {
    return intl.formatMessage({ id: `enums.${enumName}.${value}` });
  };
}

export function TranslateEnum<E extends Enum>(props: { enum: E; value: EnumValue<E> }) {
  const translate = useTranslateEnum();

  return <>{translate(props.enum, props.value)}</>;
}
