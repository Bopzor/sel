import clsx from 'clsx';
import { Component, ComponentProps, mergeProps, splitProps } from 'solid-js';

import { Link } from './link';
import { Spinner } from './spinner';

type ButtonProps = ComponentProps<'button'> & {
  variant?: 'primary' | 'secondary';
  loading?: boolean;
};

export const Button: Component<ButtonProps> = (_props) => {
  const props2 = mergeProps({ variant: 'primary' } satisfies ButtonProps, _props);
  const [own, props] = splitProps(props2, ['variant', 'loading', 'classList']);

  return (
    <button
      type="button"
      classList={{
        button: true,
        'button-primary': own.variant === 'primary',
        'button-secondary': own.variant === 'secondary',
        ...own.classList,
      }}
      {...props}
    >
      {props.children}
      {own.loading && <Spinner class="h-1 w-1" />}
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
