import { Show } from 'solid-js';

import { getLetsConfig } from '../utils/lets-config';

export function CurrencyAmount(props: { amount: number }) {
  const config = getLetsConfig();

  return (
    <>
      <Show when={props.amount === 1}>
        {props.amount} {config()?.currency}
      </Show>

      <Show when={props.amount !== 1}>
        {props.amount} {config()?.currencyPlural}
      </Show>
    </>
  );
}
