import clsx from 'clsx';
import { ComponentProps, JSX, mergeProps, Show } from 'solid-js';

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

export function Card2(props: ComponentProps<'section'>) {
  return <section {...props} />;
}

export function CardHeader(props: ComponentProps<'header'>) {
  return <header {...props} class={clsx(props.class, 'mb-2')} />;
}

export function CardTitle(props: ComponentProps<'h2'>) {
  return <h2 {...props} class={clsx(props.class, 'text-xl font-semibold text-dim')} />;
}

export function CardContent(props: ComponentProps<'div'>) {
  return <div {...props} class={clsx(props.class, 'rounded-lg bg-neutral p-4 shadow-sm md:p-8')} />;
}
