import { Trans } from '@lingui/react/macro';
import { EmptyState, LinkButton } from '@sel/ui';

import { routes } from 'src/app/routes';
import { Link } from 'src/components/link';

export function RequestNotFound() {
  return (
    <EmptyState.Root icon="request">
      <EmptyState.Title level={1}>
        <Trans>Request not found</Trans>
      </EmptyState.Title>
      <EmptyState.Description>
        <Trans>The link may be wrong, or the request may no longer exist.</Trans>
      </EmptyState.Description>
      <EmptyState.Action>
        <LinkButton Link={Link} href={routes.requests()} variant="secondary">
          <Trans>See the requests</Trans>
        </LinkButton>
      </EmptyState.Action>
    </EmptyState.Root>
  );
}
