import clsx from 'clsx';
import { Component, JSX, Show, splitProps } from 'solid-js';

type InputProps = JSX.InputHTMLAttributes<HTMLInputElement> & {
  width?: 'full';
  start?: JSX.Element;
};

export const Input: Component<InputProps> = (_props) => {
  const [{ class: className }, props] = splitProps(_props, ['class']);

  return (
    <div
      class={clsx(
        'row items-center gap-4 rounded-lg bg-neutral px-4 focus-within:shadow',
        props.width === 'full' && 'w-full',
        className
      )}
    >
      <Show when={props.start}>
        <div>{props.start}</div>
      </Show>

      <input ref={props.ref ?? undefined} class="w-full self-stretch py-3 outline-none" {...props} />
    </div>
  );
};
