import { Component, ComponentProps, Show, mergeProps, splitProps } from 'solid-js';

import { createDebouncedValue } from '../utils/debounce';

import { Link } from './link';
import { Spinner } from './spinner';

type ButtonVariant = 'primary' | 'secondary';

type ButtonProps = ComponentProps<'button'> & {
  variant?: ButtonVariant;
  loading?: boolean;
};

export const Button: Component<ButtonProps> = (props1) => {
  const props2 = mergeProps({ type: 'button', variant: 'primary' } satisfies ButtonProps, props1);
  const [props, buttonProps] = splitProps(props2, ['variant', 'loading', 'disabled', 'classList']);

  const loading = createDebouncedValue(() => props.loading, 200);

  return (
    <button
      disabled={props.disabled ?? loading()}
      classList={{
        button: true,
        'button-primary': props.variant === 'primary',
        'button-secondary': props.variant === 'secondary',
        ...props.classList,
      }}
      {...buttonProps}
    >
      {buttonProps.children}
      <Show when={loading()}>
        <Spinner class="h-4 w-4" />
      </Show>
    </button>
  );
};

type LinkButtonProps = ComponentProps<typeof Link> & {
  variant?: ButtonVariant;
  loading?: boolean;
};

export const LinkButton: Component<LinkButtonProps> = (props1) => {
  const props = mergeProps({ variant: 'primary' } satisfies Omit<LinkButtonProps, 'href'>, props1);

  return (
    <Link
      {...props}
      unstyled
      classList={{
        button: true,
        'button-primary': props.variant === 'primary',
        'button-secondary': props.variant === 'secondary',
        ...props.classList,
      }}
    >
      {props.children}
      {props.loading && <Spinner class="h-4 w-4" />}
    </Link>
  );
};
