import { LinkButton } from '@sel/ui';
import { defined } from '@sel/utils';
import { Link as RouterLink } from 'react-router';

export function Link({ href, ...props }: React.ComponentProps<'a'>) {
  return <RouterLink to={defined(href)} {...props} />;
}

export function BackButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <LinkButton Link={Link} href={href} variant="ghost" size="sm" icon="back" className="-ml-3 self-start">
      {children}
    </LinkButton>
  );
}
