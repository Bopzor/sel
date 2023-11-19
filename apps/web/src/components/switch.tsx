import clsx from 'clsx';
import { JSX, splitProps } from 'solid-js';

type SwitchProps = JSX.InputHTMLAttributes<HTMLInputElement>;

export const Switch = (_props: SwitchProps) => {
  const [own, props] = splitProps(_props, ['children']);

  return (
    <label class="relative inline-flex cursor-pointer items-center">
      <input type="checkbox" class="peer sr-only" {...props} />

      <div
        class={clsx(
          'h-5 w-9 rounded-full bg-gray-300',
          "after:absolute after:start-[2px] after:top-[4px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-['']",
          'peer-checked:bg-primary peer-checked:after:translate-x-full peer-focus-visible:ring'
        )}
      />

      <span class="ms-3 select-none font-medium text-dim">{own.children}</span>
    </label>
  );
};
