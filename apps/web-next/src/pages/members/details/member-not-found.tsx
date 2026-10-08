import { Trans } from '@lingui/react/macro';
import { EmptyState, LinkButton } from '@sel/ui';

import { routes } from 'src/app/routes';
import { Link } from 'src/components/link';

export function MemberNotFound() {
  return (
    <EmptyState.Root icon="members">
      <EmptyState.Title level={1}>
        <Trans>Member not found</Trans>
      </EmptyState.Title>
      <EmptyState.Description>
        <Trans>The link may be wrong, or the member may no longer be active.</Trans>
      </EmptyState.Description>
      <EmptyState.Action>
        <LinkButton Link={Link} href={routes.members()} variant="secondary">
          <Trans>See the members</Trans>
        </LinkButton>
      </EmptyState.Action>
    </EmptyState.Root>
  );
}
