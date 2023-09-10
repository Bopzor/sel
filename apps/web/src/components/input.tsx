import clsx from 'clsx';
import { Component, JSX, Show } from 'solid-js';

type InputProps = JSX.InputHTMLAttributes<HTMLInputElement> & {
  width?: 'full';
  start?: JSX.Element;
};

export const Input: Component<InputProps> = (props) => {
  return (
    <div
      class={clsx(
        'row items-center gap-4 rounded-lg border border-transparent bg-neutral px-4 focus-within:shadow',
        props.width === 'full' && 'w-full'
      )}
    >
      <Show when={props.start}>
        <div>{props.start}</div>
      </Show>

      <input
        ref={props.ref ?? undefined}
        class={clsx('w-full self-stretch py-3 outline-none', props.class)}
        {...props}
      />
    </div>
  );
};
