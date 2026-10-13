import { Plural, Trans } from '@lingui/react/macro';
import { TransactionStatus } from '@sel/shared';
import { Card, Icon } from '@sel/ui';
import { useInfiniteQuery } from '@tanstack/react-query';

import { queries } from 'src/app/queries';
import { routes } from 'src/app/routes';
import { useSession } from 'src/app/session';
import { Link } from 'src/components/link';
import { TransactionItem } from 'src/components/transaction-item';

const maxItems = 3;

export function PendingTransactionsCard({ className }: { className?: string }) {
  const me = useSession();
  const { data } = useInfiniteQuery(
    queries.listMemberTransactions(me.id, { status: TransactionStatus.pending, payerId: me.id }),
  );

  if (!data?.total) {
    return null;
  }

  return (
    <Card.Root className={className}>
      <Card.Header compact>
        <Card.Title level={2}>
          <Trans>Pending exchanges</Trans>
        </Card.Title>
      </Card.Header>

      <ul className="border-t last-of-type:border-b">
        {data.items.slice(0, maxItems).map((transaction) => (
          <TransactionItem key={transaction.id} member={me} transaction={transaction} />
        ))}
      </ul>

      {data.total > maxItems && (
        <Card.Footer compact>
          <Link
            href={routes.member(me.id, 'exchanges')}
            className="row items-center gap-2 text-body-sm font-medium text-muted underline"
          >
            <Plural value={data.total} other="See all # pending exchanges" />
            <Icon name="next" size="sm" />
          </Link>
        </Card.Footer>
      )}
    </Card.Root>
  );
}
