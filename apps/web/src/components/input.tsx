import clsx from 'clsx';
import { JSX, Show, mergeProps, splitProps } from 'solid-js';

import { Field, FieldVariant, FieldWidth } from './field';

type InputProps = JSX.InputHTMLAttributes<HTMLInputElement> & {
  variant?: FieldVariant;
  width?: FieldWidth;
  start?: JSX.Element;
  end?: JSX.Element;
};

export function Input(props1: InputProps) {
  const props2 = mergeProps({ variant: 'solid', width: 'full' } satisfies InputProps, props1);
  const [props, fieldProps, inputProps] = splitProps(props2, ['start', 'end'], ['variant', 'width', 'class']);

  return (
    <Field {...fieldProps}>
      <Show when={props.start}>
        <div class="mx-4">{props.start}</div>
      </Show>

      <input
        ref={inputProps.ref ?? undefined}
        class={clsx('w-full self-stretch bg-transparent px-4 py-3 outline-none', props.start && 'pl-0')}
        {...inputProps}
      />

      <Show when={props.end}>
        <div class="mx-4">{props.end}</div>
      </Show>
    </Field>
  );
}
