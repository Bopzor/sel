import { A } from '@solidjs/router';
import clsx from 'clsx';
import { Component, ComponentProps, splitProps } from 'solid-js';

type LinkProps = ComponentProps<typeof A> & {
  unstyled?: boolean;
};

export const Link: Component<LinkProps> = (props) => {
  const [unstyled, rest] = splitProps(props, ['unstyled']);

  return <A {...rest} class={clsx(props.class, unstyled && 'unstyled')} />;
};
