import { Plural, Trans } from '@lingui/react/macro';
import { RequestStatus, type RequestListItem } from '@sel/shared';
import { Badge, Button, Card, EmptyState, LinkButton, ListItem, Skeleton } from '@sel/ui';
import { useInfiniteQuery, useSuspenseQuery } from '@tanstack/react-query';

import { formatMemberName } from 'src/app/format';
import { queries } from 'src/app/queries';
import { routes } from 'src/app/routes';
import { ApiFailed } from 'src/components/api-result';
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
      <Card.Root
        aria-busy={query.isPlaceholderData}
        className={query.isPlaceholderData ? 'opacity-60 transition' : 'transition'}
      >
        <ul>
          {requests.map((request) => (
            <RequestListItem key={request.id} request={request} />
          ))}
        </ul>
      </Card.Root>

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

function Bullet() {
  return <span aria-hidden> &bull; </span>;
}

function RequestListItem({ request }: { request: RequestListItem }) {
  const { requester } = request;
  // TODO: show the comments count once the list endpoint returns it.
  const commentsCount = 0;
  const name = formatMemberName(requester);

  return (
    <ListItem.Root>
      <MemberAvatar member={requester} decorative className="self-start" />

      <ListItem.Content className="gap-1">
        <ListItem.Header>
          <ListItem.Title className="text-body-strong">
            <ListItem.Link Link={Link} href={routes.request(request.id)}>
              {request.title}
            </ListItem.Link>
          </ListItem.Title>

          {request.status !== RequestStatus.pending && <StatusBadge status={request.status} />}
        </ListItem.Header>

        <ListItem.Description>{excerpt(request.message.body)}</ListItem.Description>

        <p className="mt-1 text-caption text-subtle">
          <span className="font-semibold">{name}</span>

          <Bullet />

          {/* Above the row's link, so that the full date shows on hover. */}
          <RelativeDate date={request.date} className="relative whitespace-nowrap" />

          {commentsCount > 0 && (
            <>
              <Bullet />
              <Plural value={commentsCount} one="# comment" other="# comments" />
            </>
          )}
        </p>
      </ListItem.Content>

      <ListItem.Chevron />
    </ListItem.Root>
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

// Plain text: the formatting does not fit in two lines. The blocks are separated by a space.
function excerpt(html: string) {
  const { body } = new DOMParser().parseFromString(html, 'text/html');

  body.querySelectorAll('p, li, br').forEach((element) => element.after(' '));

  return body.textContent.replace(/\s+/g, ' ').trim();
}

function RequestListSkeleton() {
  return (
    <Card.Root aria-busy>
      <ul>
        {Array.from({ length: 5 }, (_, index) => (
          <ListItem.Root key={index} className="items-start">
            <Skeleton variant="circle" />
            <ListItem.Content className="gap-2 py-0.5">
              <Skeleton className="w-2/3" />
              <Skeleton className="w-full" />
              <Skeleton className="h-3 w-1/3" />
            </ListItem.Content>
          </ListItem.Root>
        ))}
      </ul>
    </Card.Root>
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
