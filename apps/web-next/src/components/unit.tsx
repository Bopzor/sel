import { useConfig } from 'src/app/config';

export function Unit({ plural }: { plural?: boolean }) {
  const { currency, currencyPlural } = useConfig();

  return plural ? currencyPlural : currency;
}
