import clsx from 'clsx';
import { JSX, mergeProps, Show } from 'solid-js';

export function Card(props_: {
  padding?: boolean;
  title?: JSX.Element;
  children: JSX.Element;
  class?: string;
}) {
  const props = mergeProps({ padding: true }, props_);

  return (
    <section>
      <Show when={props.title}>
        <header class="mb-2">
          <h2 class="text-xl font-semibold text-dim">{props.title}</h2>
        </header>
      </Show>

      <div
        class={clsx('rounded-lg bg-neutral shadow-sm', props.class)}
        classList={{ 'p-4 md:p-8': props.padding }}
      >
        {props.children}
      </div>
    </section>
  );
}

export function CardFallback(props: { class?: string; children: JSX.Element }) {
  return (
    <div class={clsx('row min-h-16 items-center justify-center font-medium text-dim', props.class)}>
      {props.children}
    </div>
  );
}
