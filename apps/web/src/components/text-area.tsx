import { JSX, splitProps } from 'solid-js';

import { createId } from 'src/utils/id';

import { field, FieldVariant } from './field';
import { FormControl } from './form-control';

type TextAreaProps = JSX.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  variant?: FieldVariant;
  label?: JSX.Element;
  error?: JSX.Element;
  helperText?: JSX.Element;
  classes?: Partial<Record<'root' | 'field', string>>;
};

export function TextArea(_props: TextAreaProps) {
  const id = createId(() => _props.id);

  const [formControlProps, fieldProps, props, textAreaProps] = splitProps(
    _props,
    ['label', 'error', 'helperText', 'class'],
    ['variant'],
    ['classes'],
  );

  return (
    <FormControl id={id()} {...formControlProps} class={props.classes?.root}>
      <div class={field({ ...fieldProps, class: props.classes?.field })}>
        <textarea class="w-full bg-neutral px-4 py-3" {...textAreaProps} />
      </div>
    </FormControl>
  );
}
