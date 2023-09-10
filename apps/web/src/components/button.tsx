import clsx from 'clsx';
import { Component, ComponentProps } from 'solid-js';

import { Link } from './link';
import { Spinner } from './spinner';

type ButtonProps = ComponentProps<'button'> & {
  loading?: boolean;
};

export const Button: Component<ButtonProps> = (props) => {
  return (
    <button class={clsx('button', props.class)} {...props}>
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
    <Link class={clsx('button', props.class)} {...props}>
      {props.children}
      {props.loading && <Spinner class="h-1 w-1" />}
    </Link>
  );
};
