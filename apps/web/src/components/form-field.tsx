import clsx from 'clsx';
import { ComponentProps, JSX, Show } from 'solid-js';

type FormFieldProps = {
  label?: JSX.Element;
  labelProps?: ComponentProps<'label'>;
  helperText?: JSX.Element;
  error?: JSX.Element;
  class?: string;
  children: JSX.Element;
};

// todo: aria-errormessage
export function FormField(props: FormFieldProps) {
  return (
    <div class={props.class}>
      <Show when={props.label !== undefined}>
        <label
          {...props.labelProps}
          class={clsx('mb-1 inline-block select-none font-medium text-dim', props.labelProps?.class)}
        >
          {props.label}
        </label>
      </Show>

      {props.children}

      <Show when={props.error !== undefined || props.helperText !== undefined}>
        <div
          class="ml-4 mt-1 text-sm"
          classList={{ '!text-red-700': Boolean(props.error), 'text-dim': Boolean(props.helperText) }}
        >
          {props.error ?? props.helperText}
        </div>
      </Show>
    </div>
  );
}
