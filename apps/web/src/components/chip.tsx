import clsx from 'clsx';
import { ComponentProps, splitProps } from 'solid-js';

export function Chip(props: ComponentProps<'input'> & { classes: Record<'root', string> }) {
  const [rest, inputProps] = splitProps(props, ['children', 'classes']);

  return (
    <label
      class={clsx(
        'cursor-pointer rounded-full border bg-neutral px-3 py-1 font-medium',
        'transition-all hover:shadow',
        'has-checked:border-primary has-checked:bg-primary/5',
        rest.classes.root,
      )}
    >
      <input {...inputProps} class="peer sr-only" />
      {rest.children}
    </label>
  );
}
