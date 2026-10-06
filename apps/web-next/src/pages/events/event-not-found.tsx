import { Trans } from '@lingui/react/macro';
import { EmptyState, LinkButton } from '@sel/ui';

import { routes } from 'src/app/routes';
import { Link } from 'src/components/link';

export function EventNotFound() {
  return (
    <EmptyState.Root icon="event">
      <EmptyState.Title level={1}>
        <Trans>Event not found</Trans>
      </EmptyState.Title>
      <EmptyState.Description>
        <Trans>The link may be wrong, or the event may no longer exist.</Trans>
      </EmptyState.Description>
      <EmptyState.Action>
        <LinkButton Link={Link} href={routes.events()} variant="secondary">
          <Trans>See the events</Trans>
        </LinkButton>
      </EmptyState.Action>
    </EmptyState.Root>
  );
}
