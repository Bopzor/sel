import clsx from 'clsx';
import { Component, ComponentProps, mergeProps, splitProps } from 'solid-js';

import { Link } from './link';
import { Spinner } from './spinner';

type ButtonProps = ComponentProps<'button'> & {
  variant?: 'primary' | 'secondary';
  loading?: boolean;
};

export const Button: Component<ButtonProps> = (props1) => {
  const props2 = mergeProps({ type: 'button', variant: 'primary' } satisfies ButtonProps, props1);
  const [props, buttonProps] = splitProps(props2, ['variant', 'loading', 'disabled', 'classList']);

  return (
    <button
      disabled={props.disabled ?? props.loading}
      classList={{
        button: true,
        'button-primary': props.variant === 'primary',
        'button-secondary': props.variant === 'secondary',
        ...props.classList,
      }}
      {...buttonProps}
    >
      {buttonProps.children}
      {props.loading && <Spinner class="h-4 w-4" />}
    </button>
  );
};

type LinkButtonProps = ComponentProps<typeof Link> & {
  loading?: boolean;
};

export const LinkButton: Component<LinkButtonProps> = (props) => {
  return (
    <Link {...props} class={clsx('button', props.class)}>
      {props.children}
      {props.loading && <Spinner class="h-4 w-4" />}
    </Link>
  );
};
