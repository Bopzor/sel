import { Plural, Trans, useLingui } from '@lingui/react/macro';
import { EventKind, type EventsListItem } from '@sel/shared';
import { Badge, Button, Card, EmptyState, Icon, LinkButton, Skeleton } from '@sel/ui';
import { useInfiniteQuery, useSuspenseQuery } from '@tanstack/react-query';
import clsx from 'clsx';

import { formatExcerpt } from 'src/app/format';
import { queries } from 'src/app/queries';
import { routes } from 'src/app/routes';
import { ApiFailed } from 'src/components/api-result';
import { Bullet } from 'src/components/bullet';
import { Link } from 'src/components/link';
import { FetchNextPageError, Pagination } from 'src/components/pagination';

import type { EventFilters } from './events-filters';

type EventListProps = {
  filters: EventFilters;
  hasFilters: boolean;
  onClearFilters: () => void;
};

export function EventList({ filters, hasFilters, onClearFilters }: EventListProps) {
  const { data: me } = useSuspenseQuery(queries.session());

  const query = useInfiniteQuery(
    queries.listEvents({
      timing: filters.timing === 'all' ? undefined : filters.timing,
      // The events without a date are still to come.
      includeUndated: filters.timing === 'upcoming' ? 'true' : undefined,
      search: filters.search || undefined,
      organizerId: filters.mine ? me.id : undefined,
      participantId: filters.going ? me.id : undefined,
    }),
  );

  // With data, a failed refetch keeps the list on screen.
  if (query.error && !query.data) {
    return (
      <ApiFailed
        title={<Trans>Unable to load the events</Trans>}
        retrying={query.isFetching}
        retry={() => void query.refetch()}
      />
    );
  }

  if (!query.data) {
    return <EventListSkeleton />;
  }

  const { items: events, total } = query.data;

  if (events.length === 0) {
    return hasFilters ? <NoMatchingEvent onClearFilters={onClearFilters} /> : <NoEvent />;
  }

  return (
    <div className="stack gap-4">
      <ul
        aria-busy={query.isPlaceholderData}
        className={clsx('stack gap-4 transition', query.isPlaceholderData && 'opacity-60')}
      >
        {events.map((event) => (
          <li key={event.id}>
            <EventCard event={event} />
          </li>
        ))}
      </ul>

      <FetchNextPageError query={query} />

      <Pagination query={query}>
        {query.hasNextPage ? (
          <Trans>
            Showing {events.length} of {total} events
          </Trans>
        ) : (
          <Plural value={total} one="# event" other="# events" />
        )}
      </Pagination>
    </div>
  );
}

function EventCard({ event }: { event: EventsListItem }) {
  const { i18n } = useLingui();
  const date = event.date === undefined ? undefined : new Date(event.date);
  const participantsCount = event.participantsCount;

  return (
    <Card.Root>
      <Card.Body className="row items-start gap-3 p-3! md:gap-4 md:p-4!">
        <DateIcon date={date} />

        <div className="stack min-w-0 flex-1 gap-1">
          <div className="row items-center justify-between gap-3">
            <Card.Title level={2} className="line-clamp-2 text-body-strong!">
              <Card.Link Link={Link} href={routes.event(event.id)}>
                {event.title}
              </Card.Link>
            </Card.Title>

            <div className="row shrink-0 gap-2">
              {event.participation === 'yes' && (
                <Badge tone="success" icon="check" className="max-xs:px-1.5 max-xs:*:last:sr-only">
                  <Trans>Coming</Trans>
                </Badge>
              )}

              {event.kind === EventKind.external && (
                <Badge tone="accent">
                  <Trans>Outside event</Trans>
                </Badge>
              )}
            </div>
          </div>

          <p className="line-clamp-2 text-body-sm text-muted">{formatExcerpt(event.message.body)}</p>

          <p className="mt-1 text-caption text-subtle">
            {date === undefined ? (
              <Trans>Date to be defined</Trans>
            ) : (
              <time dateTime={event.date}>
                {date.toLocaleTimeString(i18n.locale, { hour: 'numeric', minute: '2-digit' })}
              </time>
            )}

            {event.location && (
              <>
                <Bullet />
                {event.location.city}
              </>
            )}

            {participantsCount > 0 && (
              <>
                <Bullet />
                <Plural value={participantsCount} one="# participant" other="# participants" />
              </>
            )}
          </p>
        </div>
      </Card.Body>
    </Card.Root>
  );
}

function DateIcon({ date }: { date?: Date }) {
  const { i18n } = useLingui();

  const day = date?.getDate();
  const month = date?.toLocaleDateString(i18n.locale, { month: 'short' }).replace('.', '');
  const year = date?.getFullYear();

  const sameYear = year === new Date().getFullYear();

  return (
    <div
      aria-hidden
      className="stack size-14 shrink-0 items-center justify-center rounded-md bg-primary-subtle text-primary"
    >
      {date === undefined ? (
        <Icon name="event" />
      ) : (
        <>
          <span className="text-title-3 leading-none">{day}</span>
          <span className="text-caption uppercase">{month}</span>
          {!sameYear && <span className="text-caption leading-none">{year}</span>}
        </>
      )}
    </div>
  );
}

function EventListSkeleton() {
  return (
    <ul aria-busy className="stack gap-4">
      {Array.from({ length: 5 }, (_, index) => (
        <li key={index}>
          <Card.Root>
            <Card.Body className="row items-start gap-3">
              <Skeleton variant="rect" className="size-14" />
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

function NoEvent() {
  return (
    <EmptyState.Root icon="event">
      <EmptyState.Title>
        <Trans>No upcoming events</Trans>
      </EmptyState.Title>
      <EmptyState.Description>
        <Trans>When a member organizes an event, it appears here.</Trans>
      </EmptyState.Description>
      <EmptyState.Action>
        <LinkButton Link={Link} href={routes.createEvent()} icon="add">
          <Trans>Create an event</Trans>
        </LinkButton>
      </EmptyState.Action>
    </EmptyState.Root>
  );
}

function NoMatchingEvent({ onClearFilters }: { onClearFilters: () => void }) {
  return (
    <EmptyState.Root icon="search">
      <EmptyState.Title>
        <Trans>No event matches these filters</Trans>
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
