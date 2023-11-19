import { JSX, Show } from 'solid-js';

type FormFieldProps = {
  label?: JSX.Element;
  error?: JSX.Element;
  class?: string;
  children: JSX.Element;
};

export const FormField = (props: FormFieldProps) => (
  <div class={props.class}>
    <Show when={props.label !== undefined}>
      <label class="mb-1 inline-block select-none font-medium text-dim">{props.label}</label>
    </Show>

    {props.children}

    <Show when={props.error !== undefined}>
      <div class="ml-4 mt-1 text-sm text-red-700">{props.error}</div>
    </Show>
  </div>
);
