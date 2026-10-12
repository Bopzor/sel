import { Plural, Trans } from '@lingui/react/macro';
import { RequestStatus, TransactionStatus, type RequestListItem } from '@sel/shared';
import { Card, Icon, ListItem } from '@sel/ui';
import { useInfiniteQuery, useSuspenseQuery } from '@tanstack/react-query';
import { useId } from 'react';

import { queries } from 'src/app/queries';
import { routes } from 'src/app/routes';
import { Bullet } from 'src/components/bullet';
import { Link } from 'src/components/link';
import { RelativeDate } from 'src/components/relative-date';
import { TransactionItem } from 'src/components/transaction-item';

const maxItems = 3;

export function AttentionSection() {
  const { data: me } = useSuspenseQuery(queries.session());
  const titleId = useId();

  const transactionsQuery = useInfiniteQuery(
    queries.listMemberTransactions(me.id, { status: TransactionStatus.pending, payerId: me.id }),
  );

  const requestsQuery = useInfiniteQuery(
    queries.listRequests({ requesterId: me.id, status: RequestStatus.pending }),
  );

  const transactions = transactionsQuery.data;
  const requests = requestsQuery.data;

  // Shown once there is something to do, so that it does not appear empty.
  if (!transactions?.total && !requests?.total) {
    return null;
  }

  return (
    <section aria-labelledby={titleId} className="stack gap-3">
      <h2 id={titleId} className="text-title-2">
        <Trans>Needs your attention</Trans>
      </h2>

      {transactions !== undefined && transactions.total > 0 && (
        <Card.Root>
          <Card.Header compact>
            <Card.Title level={3}>
              <Trans>Pending exchanges</Trans>
            </Card.Title>
          </Card.Header>

          <ul className="border-t last-of-type:border-b">
            {transactions.items.slice(0, maxItems).map((transaction) => (
              <TransactionItem key={transaction.id} member={me} transaction={transaction} />
            ))}
          </ul>

          {transactions.total > maxItems && (
            <Card.Footer compact>
              <Link
                href={routes.member(me.id, 'exchanges')}
                className="row items-center gap-2 text-body-sm font-medium text-muted underline"
              >
                <Plural value={transactions.total} other="See the # pending exchanges" />
                <Icon name="next" size="sm" />
              </Link>
            </Card.Footer>
          )}
        </Card.Root>
      )}

      {requests !== undefined && requests.total > 0 && (
        <Card.Root>
          <Card.Header compact>
            <Card.Title level={3}>
              <Trans>Your open requests</Trans>
            </Card.Title>
          </Card.Header>

          <ul className="border-t last-of-type:border-b">
            {requests.items.slice(0, maxItems).map((request) => (
              <OpenRequestItem key={request.id} request={request} />
            ))}
          </ul>

          {requests.total > maxItems && (
            <Card.Footer compact>
              <Link
                href={routes.requests({ mine: true })}
                className="row items-center gap-2 text-body-sm font-medium text-muted underline"
              >
                <Plural value={requests.total} other="See the # open requests" />
                <Icon name="next" size="sm" />
              </Link>
            </Card.Footer>
          )}
        </Card.Root>
      )}
    </section>
  );
}

function OpenRequestItem({ request }: { request: RequestListItem }) {
  const { positiveAnswersCount } = request;

  return (
    <ListItem.Root>
      <Icon name="request" className="text-muted" />

      <ListItem.Content>
        <ListItem.Title className="text-body-strong">
          <ListItem.Link Link={Link} href={routes.request(request.id)}>
            {request.title}
          </ListItem.Link>
        </ListItem.Title>

        <ListItem.Description>
          <RelativeDate date={request.date} className="whitespace-nowrap" />
          <Bullet />
          {positiveAnswersCount > 0 ? (
            <Plural value={positiveAnswersCount} one="# member can help" other="# members can help" />
          ) : (
            <Trans>No answers yet</Trans>
          )}
        </ListItem.Description>
      </ListItem.Content>

      <ListItem.Chevron />
    </ListItem.Root>
  );
}
