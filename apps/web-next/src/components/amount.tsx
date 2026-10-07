import { Plural, useLingui } from '@lingui/react/macro';

import { Unit } from './unit';

type AmountProps = {
  value: number;
  /** A movement of units: a positive value gets a plus sign. */
  signed?: boolean;
};

export function Amount({ value, signed = false }: AmountProps) {
  const { i18n } = useLingui();
  const count = Math.abs(value);
  const sign = value < 0 ? '− ' : signed && value > 0 ? '+ ' : '';
  const formatted = sign + new Intl.NumberFormat(i18n.locale).format(count);

  return (
    <span className="whitespace-nowrap tabular-nums">
      <Plural
        value={count}
        one={
          <>
            {formatted} <Unit />
          </>
        }
        other={
          <>
            {formatted} <Unit plural />
          </>
        }
      />
    </span>
  );
}
