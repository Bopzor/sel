import { A } from '@solidjs/router';
import clsx from 'clsx';
import { Component, ComponentProps } from 'solid-js';

type LinkProps = ComponentProps<typeof A> & {
  unstyled?: boolean;
};

export const Link: Component<LinkProps> = (props) => {
  return <A {...props} class={clsx(props.class, props.unstyled && 'hover:no-underline')} />;
};
