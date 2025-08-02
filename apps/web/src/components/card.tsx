import { cva } from 'cva';
import { JSX, Show } from 'solid-js';

type CardProps = {
  classes?: Partial<Record<keyof typeof card, string>>;
  padding?: boolean;
  title: JSX.Element;
  children: JSX.Element;
};

export function Card(props: CardProps) {
  return (
    <section>
      <Show when={props.title}>
        <header class={card.header({ class: props.classes?.header })}>
          <h2 class={card.title({ class: props.classes?.title })}>{props.title}</h2>
        </header>
      </Show>

      <div class={card.content({ class: props.classes?.content, padding: props.padding })}>
        {props.children}
      </div>
    </section>
  );
}

export const card = {
  header: cva('mb-2'),

  title: cva('text-xl font-semibold text-dim'),

  content: cva('rounded-lg bg-neutral shadow-sm', {
    variants: {
      padding: {
        true: 'p-4 md:p-8',
      },
    },
    defaultVariants: {
      padding: true,
    },
  }),

  fallback: cva('row min-h-16 items-center justify-center font-medium text-dim'),
};
