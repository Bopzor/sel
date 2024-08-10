import { Config } from '@sel/shared';
import { createResource, Show } from 'solid-js';

export function CurrencyAmount(props: { amount: number }) {
  const [data] = createResource(async () => {
    const response = await fetch('/api/config');

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return response.json() as Promise<Config>;
  });

  return (
    <>
      <Show when={props.amount === 1}>
        {props.amount} {data()?.currency}
      </Show>

      <Show when={props.amount !== 1}>
        {props.amount} {data()?.currencyPlural}
      </Show>
    </>
  );
}
