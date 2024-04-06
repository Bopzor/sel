import { ComponentProps, JSX, createEffect, createSignal, splitProps } from 'solid-js';

import { Input } from './input';

type FormattedInputOwnProps<T> = {
  value: T;
  onChange: (value: T) => void;
  parse: (value: string) => T | null;
  format: (value: T) => string;
};

type FormattedInputProps<T> = FormattedInputOwnProps<T> &
  Omit<ComponentProps<typeof Input>, keyof FormattedInputOwnProps<T>>;

export function FormattedInput<T>(props1: FormattedInputProps<T>) {
  const [own, props] = splitProps(props1, ['value', 'onChange', 'parse', 'format']);

  // eslint-disable-next-line solid/reactivity
  const [value, setValue] = createSignal(own.format(own.value));

  createEffect(() => {
    setValue(own.format(own.value));
  });

  const handleBlur: JSX.FocusEventHandler<HTMLInputElement, FocusEvent> = (event) => {
    const parsed = own.parse(event.currentTarget.value);

    if (parsed === null) {
      event.currentTarget.value = own.format(own.value);
    } else {
      own.onChange(parsed);
    }
  };

  return <Input value={value()} onBlur={handleBlur} {...props} />;
}
