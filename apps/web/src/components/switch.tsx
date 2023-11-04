import clsx from 'clsx';
import { JSX } from 'solid-js';

type SwitchProps = JSX.InputHTMLAttributes<HTMLInputElement>;

export const Switch = (props: SwitchProps) => (
  <span class="relative inline-block h-4 w-8 leading-0">
    <span
      class={clsx(
        'inline-block h-full w-full rounded-full transition-colors',
        props.checked ? 'bg-primary' : 'bg-inverted/40'
      )}
    />

    <span
      class={clsx(
        'absolute top-0 aspect-square h-[calc(100%-4px)] translate-y-[2px] rounded-full border bg-neutral',
        props.checked ? 'right-0 translate-x-[-2px]' : 'left-0 translate-x-[2px]'
      )}
    />

    <input type="checkbox" class="absolute inset-0 cursor-pointer opacity-0" {...props} />
  </span>
);

type SwitchLabelProps = SwitchProps;

export const SwitchLabel = (props: SwitchLabelProps) => (
  <div class="row items-center">
    <Switch {...props} />

    <label for={props.id} class="cursor-pointer select-none pl-2">
      {props.children}
    </label>
  </div>
);
