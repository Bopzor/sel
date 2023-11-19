import clsx from 'clsx';
import { Component, ComponentProps, mergeProps } from 'solid-js';

import { Link } from './link';
import { Spinner } from './spinner';

type ButtonProps = ComponentProps<'button'> & {
  variant?: 'primary' | 'secondary';
  loading?: boolean;
};

export const Button: Component<ButtonProps> = (_props) => {
  const props = mergeProps({ variant: 'primary' } satisfies ButtonProps, _props);

  return (
    <button
      type="button"
      {...props}
      classList={{
        button: true,
        'button-primary': props.variant === 'primary',
        'button-secondary': props.variant === 'secondary',
        ...props.classList,
      }}
    >
      {props.children}
      {props.loading && <Spinner class="h-1 w-1" />}
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
      {props.loading && <Spinner class="h-1 w-1" />}
    </Link>
  );
};
