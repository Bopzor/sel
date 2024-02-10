import clsx from 'clsx';
import { JSX, Show, mergeProps, splitProps } from 'solid-js';

type InputProps = JSX.InputHTMLAttributes<HTMLInputElement> & {
  variant?: 'solid' | 'outlined';
  width?: 'medium' | 'full';
  start?: JSX.Element;
  end?: JSX.Element;
};

export function Input(props1: InputProps) {
  const props2 = mergeProps({ variant: 'solid', width: 'full' } satisfies InputProps, props1);
  const [props, inputProps] = splitProps(props2, ['variant', 'width', 'class', 'start', 'end']);

  return (
    <div
      class={clsx(
        'row w-full items-center overflow-hidden rounded-lg border-2',
        'transition-colors focus-within:border-primary/50',
        props.class,
      )}
      classList={{
        'max-w-md': props.width === 'medium',
        'border-transparent bg-neutral shadow': props.variant === 'solid',
        'border-inverted/20': props.variant === 'outlined',
      }}
    >
      <Show when={props.start}>
        <div class="mx-4">{props.start}</div>
      </Show>

      <input
        ref={inputProps.ref ?? undefined}
        class={clsx('w-full self-stretch bg-neutral px-4 py-3 outline-none', props.start && 'pl-0')}
        {...inputProps}
      />

      <Show when={props.end}>
        <div class="mx-4">{props.end}</div>
      </Show>
    </div>
  );
}

type TextAreaProps = JSX.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  variant?: 'solid' | 'outlined';
  width?: 'medium' | 'full';
};

export function TextArea(props1: TextAreaProps) {
  const props2 = mergeProps({ variant: 'solid', width: 'full' } satisfies TextAreaProps, props1);
  const [props, textareaProps] = splitProps(props2, ['variant', 'class']);

  return (
    <div>
      <textarea
        ref={textareaProps.ref ?? undefined}
        class={clsx(
          'w-full rounded-lg border-2 px-4 py-3 outline-none',
          'bg-transparent transition-colors focus-within:border-primary/50',
          props.class,
        )}
        classList={{
          'max-w-md': textareaProps.width === 'medium',
          'border-transparent bg-neutral shadow': props.variant === 'solid',
          'border-inverted/20': props.variant === 'outlined',
        }}
        {...textareaProps}
      />
    </div>
  );
}
