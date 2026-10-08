import { Plural, Trans } from '@lingui/react/macro';
import { TransactionStatus } from '@sel/shared';
import { Alert, LinkButton } from '@sel/ui';
import { useInfiniteQuery, useSuspenseQuery } from '@tanstack/react-query';
import { useMatch } from 'react-router';

import { queries } from 'src/app/queries';
import { routes } from 'src/app/routes';
import { Link } from 'src/components/link';

export function PendingTransactionsAlert() {
  const { data: me } = useSuspenseQuery(queries.session());
  const { data } = useInfiniteQuery(
    queries.listMemberTransactions(me.id, { status: TransactionStatus.pending, payerId: me.id }),
  );

  // The exchanges tab lists them, with the actions.
  const exchangesTab = useMatch(routes.member(me.id, 'exchanges')) !== null;

  if (exchangesTab || data === undefined || data.total === 0) {
    return null;
  }

  const { total } = data;

  return (
    <Alert.Root tone="warning" className="mb-6">
      <Alert.Title>
        <Plural
          value={total}
          one="An exchange is waiting for your approval"
          other="# exchanges are waiting for your approval"
        />
      </Alert.Title>
      <Alert.Description>
        <Trans>The units will move once you accept.</Trans>
      </Alert.Description>
      <Alert.Actions>
        <LinkButton Link={Link} href={routes.member(me.id, 'exchanges')} size="sm" variant="secondary">
          <Trans>See the pending exchanges</Trans>
        </LinkButton>
      </Alert.Actions>
    </Alert.Root>
  );
}
