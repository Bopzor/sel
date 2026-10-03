import { Plural, Trans, useLingui } from '@lingui/react/macro';
import { RequestStatus, type RequestListItem } from '@sel/shared';
import {
  Badge,
  Button,
  Card,
  Chip,
  EmptyState,
  EmptyStateAction,
  EmptyStateDescription,
  EmptyStateTitle,
  Input,
  LinkButton,
  ListItem,
  ListItemChevron,
  ListItemContent,
  ListItemDescription,
  ListItemHeader,
  ListItemLink,
  ListItemTitle,
  Skeleton,
} from '@sel/ui';
import { useInfiniteQuery, useSuspenseQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { formatMemberName } from 'src/app/format';
import { queries } from 'src/app/queries';
import { routes } from 'src/app/routes';
import { ApiFailed } from 'src/components/api-result';
import { Link } from 'src/components/link';
import { MemberAvatar } from 'src/components/member-avatar';
import { FetchNextPageError, Pagination } from 'src/components/pagination';
import { RelativeDate } from 'src/components/relative-date';
import { useDebouncedValue } from 'src/hooks/use-debounced-value';
import { useFilters } from 'src/hooks/use-filters';

const filtersSchema = z.object({
  status: z.enum([RequestStatus.pending, 'all']).catch(RequestStatus.pending),
  search: z.string().catch(''),
  mine: z.stringbool().catch(false),
});

type Filters = z.output<typeof filtersSchema>;

export function RequestsPage() {
  const { filters, setFilters, hasFilters, resetFilters } = useFilters(filtersSchema);

  const [search, setSearch, clearSearch] = useDebouncedValue(filters.search, (value) =>
    setFilters({ search: value }, { replace: true }),
  );

  const clearFilters = () => {
    clearSearch();
    resetFilters();
  };

  return (
    <div className="stack gap-6">
      <header className="row flex-wrap items-center justify-between gap-4">
        <h1 className="text-title-1">
          <Trans>Requests</Trans>
        </h1>

        <LinkButton Link={Link} href={routes.createRequest()} icon="add" className="max-sm:w-full xl:w-aside">
          <Trans>New request</Trans>
        </LinkButton>
      </header>

      <div className="stack gap-6 xl:flex-row-reverse xl:items-start xl:gap-10">
        <aside className="xl:sticky xl:top-10 xl:w-aside xl:shrink-0">
          <FiltersBar filters={filters} search={search} onSearch={setSearch} onChange={setFilters} />
        </aside>

        <div className="min-w-0 flex-1">
          <RequestList filters={filters} hasFilters={hasFilters} onClearFilters={clearFilters} />
        </div>
      </div>
    </div>
  );
}

type FiltersBarProps = {
  filters: Filters;
  search: string;
  onSearch: (search: string) => void;
  onChange: (changes: Partial<Filters>) => void;
};

function FiltersBar({ filters, search, onSearch, onChange }: FiltersBarProps) {
  const { t } = useLingui();

  const statuses = [
    { value: RequestStatus.pending, label: t({ message: 'Open', context: 'requests filter' }) },
    { value: 'all', label: t({ message: 'All', context: 'requests filter' }) },
  ] as const;

  return (
    <div className="stack gap-3">
      <Input
        type="search"
        icon="search"
        aria-label={t`Search the requests`}
        placeholder={t`Search`}
        value={search}
        onChange={(event) => onSearch(event.target.value)}
      />

      <div className="row flex-wrap gap-2">
        {statuses.map(({ value, label }) => (
          <Chip key={value} selected={filters.status === value} onChange={() => onChange({ status: value })}>
            {label}
          </Chip>
        ))}

        <Chip icon="profile" selected={filters.mine} onChange={(mine) => onChange({ mine })}>
          <Trans>My requests</Trans>
        </Chip>
      </div>
    </div>
  );
}

type RequestListProps = {
  filters: Filters;
  hasFilters: boolean;
  onClearFilters: () => void;
};

function RequestList({ filters, hasFilters, onClearFilters }: RequestListProps) {
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
      <Card
        aria-busy={query.isPlaceholderData}
        className={query.isPlaceholderData ? 'opacity-60 transition' : 'transition'}
      >
        <ul>
          {requests.map((request) => (
            <RequestListItem key={request.id} request={request} />
          ))}
        </ul>
      </Card>

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
    <ListItem>
      <MemberAvatar member={requester} decorative className="self-start" />

      <ListItemContent className="gap-1">
        <ListItemHeader>
          <ListItemTitle className="text-body-strong">
            <ListItemLink Link={Link} href={routes.request(request.id)}>
              {request.title}
            </ListItemLink>
          </ListItemTitle>

          {request.status !== RequestStatus.pending && <StatusBadge status={request.status} />}
        </ListItemHeader>

        <ListItemDescription>{excerpt(request.message.body)}</ListItemDescription>

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
      </ListItemContent>

      <ListItemChevron />
    </ListItem>
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
    <Card aria-busy>
      <ul>
        {Array.from({ length: 5 }, (_, index) => (
          <ListItem key={index} className="items-start">
            <Skeleton variant="circle" />
            <ListItemContent className="gap-2 py-0.5">
              <Skeleton className="w-2/3" />
              <Skeleton className="w-full" />
              <Skeleton className="h-3 w-1/3" />
            </ListItemContent>
          </ListItem>
        ))}
      </ul>
    </Card>
  );
}

function NoRequest() {
  return (
    <EmptyState icon="request">
      <EmptyStateTitle>
        <Trans>No requests</Trans>
      </EmptyStateTitle>
      <EmptyStateDescription>
        <Trans>When a member needs a hand, their request appears here.</Trans>
      </EmptyStateDescription>
      <EmptyStateAction>
        <LinkButton Link={Link} href={routes.createRequest()} icon="add">
          <Trans>Post a request</Trans>
        </LinkButton>
      </EmptyStateAction>
    </EmptyState>
  );
}

function NoMatchingRequest({ onClearFilters }: { onClearFilters: () => void }) {
  return (
    <EmptyState icon="search">
      <EmptyStateTitle>
        <Trans>No request matches these filters</Trans>
      </EmptyStateTitle>
      <EmptyStateDescription>
        <Trans>Try other words, or clear the filters.</Trans>
      </EmptyStateDescription>
      <EmptyStateAction>
        <Button variant="secondary" onClick={onClearFilters}>
          <Trans>Clear filters</Trans>
        </Button>
      </EmptyStateAction>
    </EmptyState>
  );
}
