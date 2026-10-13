import { Plural, Trans, useLingui } from '@lingui/react/macro';
import { TransactionStatus, type Member } from '@sel/shared';
import { Button, Card, Chip, EmptyState, ListItem, Skeleton } from '@sel/ui';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { useId } from 'react';
import z from 'zod';

import { queries } from 'src/app/queries';
import { useSession } from 'src/app/session';
import { Amount } from 'src/components/amount';
import { ApiFailed, QueryResult } from 'src/components/api-result';
import { DefinitionItem } from 'src/components/definition-item';
import { FetchNextPageError, Pagination } from 'src/components/pagination';
import { TransactionItem } from 'src/components/transaction-item';
import { useFilters } from 'src/hooks/use-filters';

const filtersSchema = z.object({
  withMe: z.stringbool().catch(false),
  canceled: z.stringbool().catch(false),
});

export function ExchangesTab({ member }: { member: Member }) {
  const me = useSession();

  return (
    <div className="stack gap-6 pt-6">
      <TransactionStats member={member} />
      {member.id === me.id && <PendingTransactions member={member} />}
      <CompletedTransactions member={member} />
    </div>
  );
}

function TransactionStats({ member }: { member: Member }) {
  const { t } = useLingui();
  const query = useQuery(queries.memberTransactionStats(member.id));

  return (
    <QueryResult
      query={query}
      failed={
        <ApiFailed
          title={<Trans>Unable to load the exchanges summary</Trans>}
          retrying={query.isFetching}
          retry={() => void query.refetch()}
        />
      }
      loading={<StatsSkeleton />}
    >
      {(stats) => (
        <Card.Root>
          <Card.Body compact>
            <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              <DefinitionItem label={t`Balance`} className="text-body-strong">
                <Amount value={member.balance} />
              </DefinitionItem>
              <DefinitionItem label={t`Given`}>
                <Amount value={stats.given} />
              </DefinitionItem>
              <DefinitionItem label={t`Received`}>
                <Amount value={stats.received} />
              </DefinitionItem>
              <DefinitionItem label={t`Exchanges`} className="tabular-nums">
                {stats.count}
              </DefinitionItem>
              <DefinitionItem label={t`Partners`} className="tabular-nums">
                {stats.partners}
              </DefinitionItem>
            </dl>
          </Card.Body>
        </Card.Root>
      )}
    </QueryResult>
  );
}

function StatsSkeleton() {
  return (
    <Card.Root aria-busy>
      <Card.Body compact className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="stack gap-2">
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="w-3/4" />
          </div>
        ))}
      </Card.Body>
    </Card.Root>
  );
}

function PendingTransactions({ member }: { member: Member }) {
  const query = useInfiniteQuery(queries.listMemberTransactions(member.id, { status: 'pending' }));
  const titleId = useId();

  if (query.data?.items.length === 0 || query.isLoading) {
    return null;
  }

  return (
    <section aria-labelledby={titleId} className="stack gap-3">
      <h2 id={titleId} className="text-title-3">
        <Trans>Pending</Trans>
      </h2>

      <QueryResult
        query={query}
        failed={
          <ApiFailed
            title={<Trans>Unable to load pending exchanges</Trans>}
            retrying={query.isFetching}
            retry={() => void query.refetch()}
          />
        }
        loading={null}
      >
        {({ items: transactions, total }) => (
          <div className="stack gap-4">
            <Card.Root>
              <ul>
                {transactions.map((transaction) => (
                  <TransactionItem key={transaction.id} member={member} transaction={transaction} />
                ))}
              </ul>
            </Card.Root>

            <FetchNextPageError query={query} />

            {query.hasNextPage && (
              <Pagination query={query}>
                <Trans>
                  Showing {transactions.length} of {total} pending exchanges
                </Trans>
              </Pagination>
            )}
          </div>
        )}
      </QueryResult>
    </section>
  );
}

function CompletedTransactions({ member }: { member: Member }) {
  const me = useSession();
  const isMe = me.id === member.id;

  const { filters, setFilters, resetFilters } = useFilters(filtersSchema);
  const withMe = filters.withMe && !isMe;
  const canceled = filters.canceled && isMe;

  const query = useInfiniteQuery(
    queries.listMemberTransactions(member.id, {
      status: canceled ? TransactionStatus.canceled : TransactionStatus.completed,
      counterpartId: withMe ? me.id : undefined,
    }),
  );

  return (
    <section className="stack gap-3">
      <div className="row flex-wrap items-center justify-between gap-3">
        <h2 className="text-title-3">
          <Trans>History</Trans>
        </h2>

        {isMe && (
          <div className="row gap-2">
            <Chip selected={!canceled} onChange={() => setFilters({ canceled: false })}>
              <Trans context="exchanges filter">Completed</Trans>
            </Chip>
            <Chip selected={canceled} onChange={() => setFilters({ canceled: true })}>
              <Trans context="exchanges filter">Declined</Trans>
            </Chip>
          </div>
        )}

        {!isMe && (
          <div className="row gap-2">
            <Chip selected={!withMe} onChange={() => setFilters({ withMe: false })}>
              <Trans context="exchanges filter">All</Trans>
            </Chip>
            <Chip selected={withMe} onChange={() => setFilters({ withMe: true })}>
              <Trans>With me</Trans>
            </Chip>
          </div>
        )}
      </div>

      <QueryResult
        query={query}
        failed={
          <ApiFailed
            title={<Trans>Unable to load exchanges</Trans>}
            retrying={query.isFetching}
            retry={() => void query.refetch()}
          />
        }
        loading={<TransactionListSkeleton count={3} />}
        empty={
          withMe ? (
            <NoExchangeWithMe member={member} onClearFilters={resetFilters} />
          ) : canceled ? (
            <NoCanceledExchange onClearFilters={resetFilters} />
          ) : (
            <NoExchange member={member} isMe={isMe} />
          )
        }
      >
        {({ items: transactions, total }) => (
          <div className="stack gap-4">
            <Card.Root
              aria-busy={query.isPlaceholderData}
              className={clsx('transition', query.isPlaceholderData && 'opacity-60')}
            >
              <ul>
                {transactions.map((transaction) => (
                  <TransactionItem key={transaction.id} member={member} transaction={transaction} />
                ))}
              </ul>
            </Card.Root>

            <FetchNextPageError query={query} />

            <Pagination query={query}>
              {query.hasNextPage ? (
                <Trans>
                  Showing {transactions.length} of {total} exchanges
                </Trans>
              ) : (
                <Plural value={total} one="# exchange" other="# exchanges" />
              )}
            </Pagination>
          </div>
        )}
      </QueryResult>
    </section>
  );
}

function NoExchange({ member, isMe }: { member: Member; isMe: boolean }) {
  const name = member.firstName;

  return (
    <EmptyState.Root icon="exchange">
      <EmptyState.Title level={3}>
        <Trans>No exchanges yet</Trans>
      </EmptyState.Title>
      <EmptyState.Description>
        {isMe ? (
          <Trans>Your exchanges will appear here.</Trans>
        ) : (
          <Trans>{name}'s exchanges will appear here.</Trans>
        )}
      </EmptyState.Description>
    </EmptyState.Root>
  );
}

function NoExchangeWithMe({ member, onClearFilters }: { member: Member; onClearFilters: () => void }) {
  const name = member.firstName;

  return (
    <EmptyState.Root icon="exchange">
      <EmptyState.Title level={3}>
        <Trans>No exchanges with {name} yet</Trans>
      </EmptyState.Title>
      <EmptyState.Action>
        <Button variant="secondary" onClick={onClearFilters}>
          <Trans>Show all exchanges</Trans>
        </Button>
      </EmptyState.Action>
    </EmptyState.Root>
  );
}

function NoCanceledExchange({ onClearFilters }: { onClearFilters: () => void }) {
  return (
    <EmptyState.Root icon="canceled">
      <EmptyState.Title level={3}>
        <Trans>No declined exchanges</Trans>
      </EmptyState.Title>
      <EmptyState.Description>
        <Trans>The declined exchanges will appear here.</Trans>
      </EmptyState.Description>
      <EmptyState.Action>
        <Button variant="secondary" onClick={onClearFilters}>
          <Trans>Show completed exchanges</Trans>
        </Button>
      </EmptyState.Action>
    </EmptyState.Root>
  );
}

function TransactionListSkeleton({ count }: { count: number }) {
  return (
    <Card.Root>
      <ul aria-busy>
        {Array.from({ length: count }, (_, index) => (
          <ListItem.Root key={index} className="items-start">
            <Skeleton variant="circle" />
            <div className="stack min-w-0 flex-1 gap-2 py-0.5">
              <Skeleton className="w-1/3" />
              <Skeleton className="w-2/3" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </ListItem.Root>
        ))}
      </ul>
    </Card.Root>
  );
}
