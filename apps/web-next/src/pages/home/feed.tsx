import { Plural, Trans, useLingui } from '@lingui/react/macro';
import {
  RequestStatus,
  type FeedEvent,
  type FeedInformation,
  type FeedItem,
  type FeedRequest,
} from '@sel/shared';
import { Avatar, Badge, Button, Card, Chip, EmptyState, Input, Skeleton } from '@sel/ui';
import { useInfiniteQuery, useSuspenseQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { Fragment, useId } from 'react';
import z from 'zod';

import { formatExcerpt, formatMemberName } from 'src/app/format';
import { queries } from 'src/app/queries';
import { routes } from 'src/app/routes';
import { ApiFailed } from 'src/components/api-result';
import { Bullet } from 'src/components/bullet';
import { DateIcon } from 'src/components/date-icon';
import { Link } from 'src/components/link';
import { MemberAvatar } from 'src/components/member-avatar';
import { FetchNextPageError, Pagination } from 'src/components/pagination';
import { RelativeDate } from 'src/components/relative-date';
import { useDebouncedValue } from 'src/hooks/use-debounced-value';
import { useFilters } from 'src/hooks/use-filters';

const filtersSchema = z.object({
  type: z.enum(['all', 'request', 'event', 'information']).catch('all'),
  search: z.string().catch(''),
});

type FeedFilters = z.output<typeof filtersSchema>;

export function Feed({ className }: { className?: string }) {
  const { t } = useLingui();
  const titleId = useId();
  const { filters, setFilters, hasFilters, resetFilters } = useFilters(filtersSchema);

  const [search, setSearch, clearSearch] = useDebouncedValue(filters.search, (value) =>
    setFilters({ search: value }, { replace: true }),
  );

  const clearFilters = () => {
    clearSearch();
    resetFilters();
  };

  const types = [
    { value: 'all', label: t({ message: 'All', context: 'feed filter' }) },
    { value: 'request', label: t({ message: 'Requests', context: 'feed filter' }) },
    { value: 'event', label: t({ message: 'Events', context: 'feed filter' }) },
    { value: 'information', label: t({ message: 'Information', context: 'feed filter' }) },
  ] as const;

  return (
    <section aria-labelledby={titleId} className={clsx('stack gap-3', className)}>
      <h2 id={titleId} className="sr-only">
        <Trans>What's new</Trans>
      </h2>

      <Input
        type="search"
        icon="search"
        aria-label={t`Search the publications`}
        placeholder={t`Search`}
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      <div className="row flex-wrap gap-2">
        {types.map(({ value, label }) => (
          <Chip key={value} selected={filters.type === value} onChange={() => setFilters({ type: value })}>
            {label}
          </Chip>
        ))}
      </div>

      <FeedList filters={filters} hasFilters={hasFilters} onClearFilters={clearFilters} />
    </section>
  );
}

type FeedListProps = {
  filters: FeedFilters;
  hasFilters: boolean;
  onClearFilters: () => void;
};

function FeedList({ filters, hasFilters, onClearFilters }: FeedListProps) {
  const query = useInfiniteQuery(
    queries.feed({
      resourceType: filters.type === 'all' ? undefined : filters.type,
      search: filters.search || undefined,
    }),
  );

  if (query.error && !query.data) {
    return (
      <ApiFailed
        title={<Trans>Unable to load the latest news</Trans>}
        retrying={query.isFetching}
        retry={() => void query.refetch()}
      />
    );
  }

  if (!query.data) {
    return <FeedSkeleton />;
  }

  const { items, total } = query.data;

  if (items.length === 0) {
    return hasFilters ? <NoMatchingPublication onClearFilters={onClearFilters} /> : <EmptyFeed />;
  }

  return (
    <div className="stack gap-4">
      <ul
        aria-busy={query.isPlaceholderData}
        className={clsx('stack gap-4 transition', query.isPlaceholderData && 'opacity-60')}
      >
        {items.map((item) => (
          <li key={item[1].id}>
            <FeedItem item={item} />
          </li>
        ))}
      </ul>

      <FetchNextPageError query={query} />

      <Pagination query={query}>
        {query.hasNextPage ? (
          <Trans>
            Showing {items.length} of {total} publications
          </Trans>
        ) : (
          <Plural value={total} one="# publication" other="# publications" />
        )}
      </Pagination>
    </div>
  );
}

function FeedItem({ item }: { item: FeedItem }) {
  switch (item[0]) {
    case 'request':
      return <RequestCard request={item[1]} />;
    case 'event':
      return <EventCard event={item[1]} />;
    case 'information':
      return <InformationCard information={item[1]} />;
  }
}

function RequestCard({ request }: { request: FeedRequest }) {
  return (
    <FeedCard
      start={<MemberAvatar member={request.requester} decorative />}
      link={
        <Card.Link Link={Link} href={routes.request(request.id)}>
          {request.title}
        </Card.Link>
      }
      badge={<RequestStatusBadge status={request.status} />}
      excerpt={request.message.body}
      footer={{
        type: <Trans context="feed item">Request</Trans>,
        member: <span className="font-semibold">{formatMemberName(request.requester)}</span>,
        date: <RelativeDate date={request.publishedAt} className="relative whitespace-nowrap" />,
      }}
    />
  );
}

function RequestStatusBadge({ status }: { status: RequestStatus }) {
  if (status === RequestStatus.pending) {
    return null;
  }

  return (
    <Badge
      tone={status === RequestStatus.fulfilled ? 'success' : 'neutral'}
      icon={status === RequestStatus.fulfilled ? 'success' : 'canceled'}
      className="max-xs:px-1.5 max-xs:*:last:sr-only"
    >
      {status === RequestStatus.fulfilled ? <Trans>Fulfilled</Trans> : <Trans>Canceled</Trans>}
    </Badge>
  );
}

function EventCard({ event }: { event: FeedEvent }) {
  const { i18n } = useLingui();
  const date = event.date === undefined ? undefined : new Date(event.date);

  return (
    <FeedCard
      start={<DateIcon date={date} />}
      link={
        <Card.Link Link={Link} href={routes.event(event.id)}>
          {event.title}
        </Card.Link>
      }
      excerpt={event.message.body}
      footer={{
        type: <Trans context="feed item">Event</Trans>,
        date:
          date === undefined ? (
            <Trans>Date to be defined</Trans>
          ) : (
            <time dateTime={event.date}>
              <span className="sr-only">{`${date.toLocaleDateString(i18n.locale, { dateStyle: 'long' })} `}</span>
              {date.toLocaleTimeString(i18n.locale, { hour: 'numeric', minute: '2-digit' })}
            </time>
          ),
        location: event.location?.city,
      }}
    />
  );
}

function InformationCard({ information }: { information: FeedInformation }) {
  const { data: config } = useSuspenseQuery(queries.config());
  const { author } = information;

  return (
    <FeedCard
      start={
        author ? (
          <MemberAvatar member={author} decorative />
        ) : (
          <Avatar src={config.logoUrl} name={config.letsName} decorative />
        )
      }
      link={
        <Card.Link Link={Link} href={routes.informationDetails(information.id)}>
          {information.title}
        </Card.Link>
      }
      excerpt={information.message.body}
      footer={{
        type: <Trans context="feed item">Information</Trans>,
        author: <span className="font-semibold">{author ? formatMemberName(author) : config.letsName}</span>,
        date: <RelativeDate date={information.publishedAt} className="relative whitespace-nowrap" />,
      }}
    />
  );
}

type FeedCardProps = {
  start: React.ReactNode;
  link: React.ReactNode;
  badge?: React.ReactNode;
  excerpt: string;
  footer: Record<string, React.ReactNode>;
};

function FeedCard({ start, link, badge, excerpt, footer }: FeedCardProps) {
  return (
    <Card.Root>
      <Card.Body compact className="row items-start gap-2 md:gap-3">
        {start}

        <div className="stack min-w-0 flex-1 gap-1">
          <div className="row items-center justify-between gap-3">
            <h3 className="line-clamp-2 text-body-strong">{link}</h3>
            {badge}
          </div>

          <p className="line-clamp-2 text-body-sm text-muted">{formatExcerpt(excerpt)}</p>

          <p className="mt-1 text-caption text-subtle">
            {Object.entries(footer)
              .filter(([, item]) => Boolean(item))
              .map(([key, item], index) => (
                <Fragment key={key}>
                  {index > 0 && <Bullet />}
                  {item}
                </Fragment>
              ))}
          </p>
        </div>
      </Card.Body>
    </Card.Root>
  );
}

function FeedSkeleton() {
  return (
    <ul aria-busy className="stack gap-4">
      {Array.from({ length: 5 }, (_, index) => (
        <li key={index}>
          <Card.Root>
            <Card.Body compact className="row items-start gap-3">
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

function EmptyFeed() {
  return (
    <EmptyState.Root icon="information">
      <EmptyState.Title level={3}>
        <Trans>Nothing published yet</Trans>
      </EmptyState.Title>
      <EmptyState.Description>
        <Trans>The requests, events and information of the members appear here.</Trans>
      </EmptyState.Description>
    </EmptyState.Root>
  );
}

function NoMatchingPublication({ onClearFilters }: { onClearFilters: () => void }) {
  return (
    <EmptyState.Root icon="search">
      <EmptyState.Title level={3}>
        <Trans>No publication matches these filters</Trans>
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
