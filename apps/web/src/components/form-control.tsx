import clsx from 'clsx';
import { JSX, Show } from 'solid-js';

export function FormControl(props: {
  id: string;
  label?: JSX.Element;
  error?: JSX.Element;
  helperText?: JSX.Element;
  class?: string;
  children?: JSX.Element;
}) {
  return (
    <div class={clsx('col gap-1', props.class)}>
      <Show when={props.label}>
        <label for={props.id} class="max-w-fit font-medium text-dim">
          {props.label}
        </label>
      </Show>

      {props.children}

      <Show when={props.error || props.helperText}>
        {(value) => (
          <div
            id={`${props.id}-helper-text`}
            class={clsx('ml-4 text-sm', {
              'text-dim': !props.error,
              'text-red-700': props.error,
            })}
          >
            {value()}
          </div>
        )}
      </Show>
    </div>
  );
}
