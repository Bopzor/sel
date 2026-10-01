import { defined } from '@sel/utils';
import { Link as RouterLink } from 'react-router';

export function Link({ href, ...props }: React.ComponentProps<'a'>) {
  return <RouterLink to={defined(href)} {...props} />;
}
