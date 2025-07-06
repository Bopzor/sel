import clsx from 'clsx';
import { ComponentProps, splitProps } from 'solid-js';

type SwitchProps = ComponentProps<'input'>;

export function Switch(_props: SwitchProps) {
  const [own, props] = splitProps(_props, ['children']);

  return (
    <label class="relative inline-flex cursor-pointer items-center">
      <input type="checkbox" class="peer sr-only" {...props} />

      <div
        class={clsx(
          'relative h-5 w-8 rounded-full bg-gray-300 sm:w-9 dark:bg-gray-600',
          'after:absolute after:start-1 after:top-1 after:size-3 after:rounded-full after:bg-neutral',
          'sm:after:start-0.5 sm:after:top-0.5 sm:after:size-4',
          'peer-checked:bg-primary peer-focus-visible:ring-3 peer-checked:after:translate-x-full',
          "after:transition-all after:content-['']",
        )}
      />

      <span class="ms-3 font-medium whitespace-nowrap text-dim select-none">{own.children}</span>
    </label>
  );
}
