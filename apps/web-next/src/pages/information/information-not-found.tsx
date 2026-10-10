import { Trans } from '@lingui/react/macro';
import { EmptyState, LinkButton } from '@sel/ui';

import { routes } from 'src/app/routes';
import { Link } from 'src/components/link';

export function InformationNotFound() {
  return (
    <EmptyState.Root icon="information">
      <EmptyState.Title level={1}>
        <Trans>Information not found</Trans>
      </EmptyState.Title>
      <EmptyState.Description>
        <Trans>The link may be wrong, or the information may no longer exist.</Trans>
      </EmptyState.Description>
      <EmptyState.Action>
        <LinkButton Link={Link} href={routes.information()} variant="secondary">
          <Trans context="information list">See the information</Trans>
        </LinkButton>
      </EmptyState.Action>
    </EmptyState.Root>
  );
}
