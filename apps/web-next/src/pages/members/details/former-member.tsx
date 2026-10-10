import { Trans } from '@lingui/react/macro';
import { EmptyState, LinkButton } from '@sel/ui';

import { routes } from 'src/app/routes';
import { Link } from 'src/components/link';

export function FormerMember() {
  return (
    <EmptyState.Root icon="members">
      <EmptyState.Title level={1}>
        <Trans>This person is no longer a member</Trans>
      </EmptyState.Title>
      <EmptyState.Description>
        <Trans>Their profile is no longer available.</Trans>
      </EmptyState.Description>
      <EmptyState.Action>
        <LinkButton Link={Link} href={routes.members()} variant="secondary">
          <Trans>See the members</Trans>
        </LinkButton>
      </EmptyState.Action>
    </EmptyState.Root>
  );
}
