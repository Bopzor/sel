import { A } from '@solidjs/router';
import clsx from 'clsx';
import { ComponentProps, splitProps } from 'solid-js';

type LinkProps = ComponentProps<typeof A> & {
  unstyled?: boolean;
};

export function Link(props: LinkProps) {
  const [{ unstyled }, rest] = splitProps(props, ['unstyled']);

  return <A {...rest} class={clsx(props.class, unstyled && 'unstyled')} />;
}
