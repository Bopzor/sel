import { JSX, splitProps } from 'solid-js';

export function Radio(_props: { label: JSX.Element } & JSX.InputHTMLAttributes<HTMLInputElement>) {
  const [props, inputProps] = splitProps(_props, ['label']);

  return (
    <label class="row gap-2 items-center">
      <input {...inputProps} type="radio" />
      {props.label}
    </label>
  );
}
