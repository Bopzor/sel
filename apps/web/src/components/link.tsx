import { A } from '@solidjs/router';
import { ComponentProps, JSX, splitProps } from 'solid-js';

export { A as Link };

export function link(href: string, props?: Omit<ComponentProps<typeof A>, 'href'>) {
  return (children: JSX.Element) => (
    <A href={href} {...props}>
      {children}
    </A>
  );
}

export function ExternalLink(_props: ComponentProps<'a'> & { openInNewTab?: boolean }) {
  const [custom, props] = splitProps(_props, ['openInNewTab']);

  return (
    <a
      target={custom.openInNewTab ? '_blank' : undefined}
      rel={custom.openInNewTab ? 'noopener noreferrer' : undefined}
      {...props}
    />
  );
}

export function externalLink(href: string, props?: Omit<ComponentProps<typeof ExternalLink>, 'href'>) {
  return (children: JSX.Element) => (
    <ExternalLink href={href} {...props}>
      {children}
    </ExternalLink>
  );
}
