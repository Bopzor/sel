import { cva } from 'cva';
import { JSX, Show, splitProps } from 'solid-js';

import { createId } from 'src/utils/id';

import { field, FieldVariant } from './field';
import { FormControl } from './form-control';

type InputProps = JSX.InputHTMLAttributes<HTMLInputElement> & {
  ref?: HTMLInputElement | ((ref: HTMLInputElement) => void);
  fieldRef?: HTMLDivElement | ((ref: HTMLDivElement) => void);
  variant?: FieldVariant;
  label?: JSX.Element;
  error?: JSX.Element;
  helperText?: JSX.Element;
  start?: JSX.Element;
  end?: JSX.Element;
  classes?: Partial<Record<'root' | 'field' | 'input', string>>;
};

export function Input(_props: InputProps) {
  const id = createId(() => _props.id);

  const [props, formControlProps, fieldRef, fieldProps, inputProps] = splitProps(
    _props,
    ['value', 'start', 'end', 'classes'],
    ['label', 'error', 'helperText'],
    ['fieldRef'],
    ['variant'],
  );

  return (
    <FormControl id={id()} class={props.classes?.root} {...formControlProps}>
      <div ref={fieldRef.fieldRef} class={field({ ...fieldProps, class: props.classes?.field })}>
        <Show when={props.start}>
          <div class="mx-4">{props.start}</div>
        </Show>

        <input
          {...inputProps}
          ref={inputProps.ref}
          aria-invalid={Boolean(formControlProps.error)}
          aria-errormessage={formControlProps.error ? `${id()}-helper-text` : undefined}
          value={Number.isNaN(props.value) ? '' : props.value}
          id={id()}
          class={input({ start: Boolean(props.start), end: Boolean(props.end), class: props.classes?.input })}
        />

        <Show when={props.end}>
          <div class="mx-4 leading-0">{props.end}</div>
        </Show>
      </div>
    </FormControl>
  );
}

const input = cva('size-full self-stretch bg-transparent px-4 outline-hidden', {
  variants: {
    start: {
      true: 'ps-0',
    },
    end: {
      true: 'pe-0',
    },
  },
});
