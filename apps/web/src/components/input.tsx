import clsx from 'clsx';
import { Component, JSX, Show, splitProps } from 'solid-js';

import { Row } from './row';

type InputProps = JSX.InputHTMLAttributes<HTMLInputElement> & {
  width?: 'medium' | 'full';
  start?: JSX.Element;
  end?: JSX.Element;
};

export const Input: Component<InputProps> = (_props) => {
  const [own, props] = splitProps(_props, ['width', 'class', 'start', 'end']);

  return (
    <Row
      class={clsx(
        'w-full overflow-hidden rounded-lg border-2',
        'border-transparent bg-neutral shadow transition-colors focus-within:border-primary/50',
        own.class
      )}
      classList={{
        'max-w-md': own.width === 'medium',
      }}
    >
      <Show when={own.start}>
        <div class="mx-4">{own.start}</div>
      </Show>

      <input
        ref={props.ref ?? undefined}
        class={clsx('w-full self-stretch px-4 py-3 outline-none', own.start && 'pl-0')}
        {...props}
      />

      <Show when={own.end}>
        <div class="mx-4">{own.end}</div>
      </Show>
    </Row>
  );
};

type TextAreaProps = JSX.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  width?: 'medium' | 'full';
};

export const TextArea: Component<TextAreaProps> = (_props) => {
  const [own, props] = splitProps(_props, ['class']);

  return (
    <div
      class={clsx(
        'row items-center gap-4 overflow-hidden rounded-lg border-2 border-transparent bg-neutral shadow transition-colors focus-within:border-primary/50',
        props.width === 'medium' && 'w-96',
        props.width === 'full' && 'w-full',
        own.class
      )}
    >
      <textarea ref={props.ref ?? undefined} class="w-full self-stretch px-4 py-3 outline-none" {...props} />
    </div>
  );
};
