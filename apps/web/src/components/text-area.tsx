import clsx from 'clsx';
import { JSX, mergeProps, splitProps } from 'solid-js';

import { Field, FieldVariant, FieldWidth } from './field';

type TextAreaProps = JSX.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  variant?: FieldVariant;
  width?: FieldWidth;
};

export function TextArea(props1: TextAreaProps) {
  const props2 = mergeProps({ variant: 'solid', width: 'full' } satisfies TextAreaProps, props1);
  const [fieldProps, textareaProps] = splitProps(props2, ['variant', 'class']);

  return (
    <Field {...fieldProps} class={clsx('h-auto', fieldProps.class)}>
      <textarea ref={textareaProps.ref ?? undefined} class="w-full bg-neutral px-4 py-3" {...textareaProps} />
    </Field>
  );
}
