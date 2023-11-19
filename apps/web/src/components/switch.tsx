import clsx from 'clsx';
import { JSX, createSignal, onMount, splitProps } from 'solid-js';

type SwitchProps = JSX.InputHTMLAttributes<HTMLInputElement>;

export const Switch = (_props: SwitchProps) => {
  const [own, props] = splitProps(_props, ['children']);

  // avoid transition on mount
  const [mounted, setMounted] = createSignal(false);

  onMount(() => {
    setTimeout(() => setMounted(true), 10);
  });

  return (
    <label class="relative inline-flex cursor-pointer items-center">
      <input type="checkbox" class="peer sr-only" {...props} />

      <div
        class={clsx(
          'h-5 w-9 rounded-full bg-gray-300',
          'after:absolute after:start-0.5 after:top-1 after:h-4 after:w-4 after:rounded-full after:bg-white',
          'peer-checked:bg-primary peer-checked:after:translate-x-full peer-focus-visible:ring'
        )}
        classList={{
          "after:content-['']": true,
          'after:transition-all': mounted(),
        }}
      />

      <span class="ms-3 select-none font-medium text-dim">{own.children}</span>
    </label>
  );
};
