import clsx from 'clsx';
import { Component, JSX, Show, splitProps } from 'solid-js';

type InputProps = JSX.InputHTMLAttributes<HTMLInputElement> & {
  width?: 'medium' | 'full';
  start?: JSX.Element;
};

export const Input: Component<InputProps> = (_props) => {
  const [{ class: className }, props] = splitProps(_props, ['class']);

  return (
    <div
      class={clsx(
        'row items-center gap-4 overflow-hidden rounded-lg bg-neutral transition-shadow focus-within:shadow',
        props.width === 'medium' && 'w-96',
        props.width === 'full' && 'w-full',
        className
      )}
    >
      <Show when={props.start}>
        <div>{props.start}</div>
      </Show>

      <input ref={props.ref ?? undefined} class="w-full self-stretch px-4 py-3 outline-none" {...props} />
    </div>
  );
};

type TextAreaProps = JSX.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  width?: 'medium' | 'full';
};

export const TextArea: Component<TextAreaProps> = (_props) => {
  const [{ class: className }, props] = splitProps(_props, ['class']);

  return (
    <div
      class={clsx(
        'row items-center gap-4 overflow-hidden rounded-lg bg-neutral transition-shadow focus-within:shadow',
        props.width === 'medium' && 'w-96',
        props.width === 'full' && 'w-full',
        className
      )}
    >
      <textarea ref={props.ref ?? undefined} class="w-full self-stretch px-4 py-3 outline-none" {...props} />
    </div>
  );
};
