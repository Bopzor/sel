import clsx from 'clsx';
import { ComponentProps, splitProps } from 'solid-js';

type SwitchProps = ComponentProps<'input'>;

export function Switch(_props: SwitchProps) {
  const [own, props] = splitProps(_props, ['children']);

  return (
    <label class="relative inline-flex cursor-pointer items-center">
      <input type="checkbox" class="peer sr-only" {...props} />

      <div
        // eslint-disable-next-line tailwindcss/no-arbitrary-value
        class={clsx(
          'relative h-5 w-8 rounded-full bg-gray-300 dark:bg-gray-600 sm:w-9',
          'after:absolute after:start-1 after:top-1 after:size-3 after:rounded-full after:bg-neutral',
          'sm:after:start-0.5 sm:after:top-0.5 sm:after:size-4',
          'peer-checked:bg-primary peer-checked:after:translate-x-full peer-focus-visible:ring-3',
          "after:transition-all after:content-['']",
        )}
      />

      <span class="ms-3 select-none whitespace-nowrap font-medium text-dim">{own.children}</span>
    </label>
  );
}
