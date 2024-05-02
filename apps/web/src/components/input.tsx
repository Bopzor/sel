import clsx from 'clsx';
import { JSX, Show, mergeProps, splitProps } from 'solid-js';

import { Field, FieldVariant, FieldWidth } from './field';

type InputProps = JSX.InputHTMLAttributes<HTMLInputElement> & {
  fieldRef?: HTMLDivElement | ((ref: HTMLDivElement) => void);
  variant?: FieldVariant;
  width?: FieldWidth;
  start?: JSX.Element;
  end?: JSX.Element;
};

export function Input(props1: InputProps) {
  const props2 = mergeProps({ variant: 'solid', width: 'full' } satisfies InputProps, props1);

  const [props, fieldRef, fieldProps, inputProps] = splitProps(
    props2,
    ['start', 'end'],
    ['fieldRef'],
    ['variant', 'width', 'class'],
  );

  return (
    <Field ref={fieldRef.fieldRef} {...fieldProps}>
      <Show when={props.start}>
        <div class="mx-4 leading-0">{props.start}</div>
      </Show>

      <input
        ref={inputProps.ref ?? undefined}
        class={clsx('size-full self-stretch bg-transparent px-4 outline-none', props.start && 'pl-0')}
        {...inputProps}
      />

      <Show when={props.end}>
        <div class="mx-4 leading-0">{props.end}</div>
      </Show>
    </Field>
  );
}
