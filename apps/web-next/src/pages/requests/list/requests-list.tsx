import { Plural, Trans } from '@lingui/react/macro';
import { RequestStatus, type RequestListItem } from '@sel/shared';
import { Badge, Button, Card, EmptyState, LinkButton, Skeleton } from '@sel/ui';
import { useInfiniteQuery, useSuspenseQuery } from '@tanstack/react-query';
import clsx from 'clsx';

import { formatExcerpt, formatMemberName } from 'src/app/format';
import { queries } from 'src/app/queries';
import { routes } from 'src/app/routes';
import { ApiFailed } from 'src/components/api-result';
import { Bullet } from 'src/components/bullet';
import { Link } from 'src/components/link';
import { MemberAvatar } from 'src/components/member-avatar';
import { FetchNextPageError, Pagination } from 'src/components/pagination';
import { RelativeDate } from 'src/components/relative-date';

import type { RequestFilters } from './requests-filters';

type RequestListProps = {
  filters: RequestFilters;
  hasFilters: boolean;
  onClearFilters: () => void;
};

export function RequestList({ filters, hasFilters, onClearFilters }: RequestListProps) {
  const { data: me } = useSuspenseQuery(queries.session());

  const query = useInfiniteQuery(
    queries.listRequests({
      status: filters.status === 'all' ? undefined : filters.status,
      search: filters.search || undefined,
      requesterId: filters.mine ? me.id : undefined,
    }),
  );

  // With data, a failed refetch keeps the list on screen.
  if (query.error && !query.data) {
    return (
      <ApiFailed
        title={<Trans>Unable to load the requests</Trans>}
        retrying={query.isFetching}
        retry={() => void query.refetch()}
      />
    );
  }

  if (!query.data) {
    return <RequestListSkeleton />;
  }

  const { items: requests, total } = query.data;

  if (requests.length === 0) {
    return hasFilters ? <NoMatchingRequest onClearFilters={onClearFilters} /> : <NoRequest />;
  }

  return (
    <div className="stack gap-4">
      <ul
        aria-busy={query.isPlaceholderData}
        className={clsx('stack gap-4 transition', query.isPlaceholderData && 'opacity-60')}
      >
        {requests.map((request) => (
          <li key={request.id}>
            <RequestCard request={request} />
          </li>
        ))}
      </ul>

      <FetchNextPageError query={query} />

      <Pagination query={query}>
        {query.hasNextPage ? (
          <Trans>
            Showing {requests.length} of {total} requests
          </Trans>
        ) : (
          <Plural value={total} one="# request" other="# requests" />
        )}
      </Pagination>
    </div>
  );
}

function RequestCard({ request }: { request: RequestListItem }) {
  const { requester } = request;
  // TODO: show the comments count once the list endpoint returns it.
  const commentsCount = 0;
  const name = formatMemberName(requester);

  return (
    <Card.Root>
      <Card.Body className="row items-start gap-2 p-3! md:gap-3 md:p-4!">
        <MemberAvatar member={requester} decorative />

        <div className="stack min-w-0 flex-1 gap-1">
          <div className="row items-center justify-between gap-3">
            <Card.Title level={2} className="line-clamp-2 text-body-strong!">
              <Card.Link Link={Link} href={routes.request(request.id)}>
                {request.title}
              </Card.Link>
            </Card.Title>

            {request.status !== RequestStatus.pending && <StatusBadge status={request.status} />}
          </div>

          <p className="line-clamp-2 text-body-sm text-muted">{formatExcerpt(request.message.body)}</p>

          <p className="mt-1 text-caption text-subtle">
            <span className="font-semibold">{name}</span>

            <Bullet />

            {/* Above the card's link, so that the full date shows on hover. */}
            <RelativeDate date={request.date} className="relative whitespace-nowrap" />

            {commentsCount > 0 && (
              <>
                <Bullet />
                <Plural value={commentsCount} one="# comment" other="# comments" />
              </>
            )}
          </p>
        </div>
      </Card.Body>
    </Card.Root>
  );
}

// Below xs, the badge shows only its icon, to leave the width to the title.
function StatusBadge({ status }: { status: RequestStatus }) {
  const fulfilled = status === RequestStatus.fulfilled;

  return (
    <Badge
      tone={fulfilled ? 'success' : 'neutral'}
      icon={fulfilled ? 'success' : 'canceled'}
      className="max-xs:px-1.5 max-xs:*:last:sr-only"
    >
      {fulfilled ? <Trans>Fulfilled</Trans> : <Trans>Canceled</Trans>}
    </Badge>
  );
}

function RequestListSkeleton() {
  return (
    <ul aria-busy className="stack gap-4">
      {Array.from({ length: 5 }, (_, index) => (
        <li key={index}>
          <Card.Root>
            <Card.Body className="row items-start gap-3">
              <Skeleton variant="circle" />
              <div className="stack min-w-0 flex-1 gap-2 py-0.5">
                <Skeleton className="w-2/3" />
                <Skeleton className="w-full" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </Card.Body>
          </Card.Root>
        </li>
      ))}
    </ul>
  );
}

function NoRequest() {
  return (
    <EmptyState.Root icon="request">
      <EmptyState.Title>
        <Trans>No requests</Trans>
      </EmptyState.Title>
      <EmptyState.Description>
        <Trans>When a member needs a hand, their request appears here.</Trans>
      </EmptyState.Description>
      <EmptyState.Action>
        <LinkButton Link={Link} href={routes.createRequest()} icon="add">
          <Trans>Post a request</Trans>
        </LinkButton>
      </EmptyState.Action>
    </EmptyState.Root>
  );
}

function NoMatchingRequest({ onClearFilters }: { onClearFilters: () => void }) {
  return (
    <EmptyState.Root icon="search">
      <EmptyState.Title>
        <Trans>No request matches these filters</Trans>
      </EmptyState.Title>
      <EmptyState.Description>
        <Trans>Try other words, or clear the filters.</Trans>
      </EmptyState.Description>
      <EmptyState.Action>
        <Button variant="secondary" onClick={onClearFilters}>
          <Trans>Clear filters</Trans>
        </Button>
      </EmptyState.Action>
    </EmptyState.Root>
  );
}
