import { Trans, useLingui } from '@lingui/react/macro';
import { EventKind, type Event } from '@sel/shared';
import { Badge, Card, Icon, Skeleton } from '@sel/ui';
import { defined, isPast } from '@sel/utils';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { useParams } from 'react-router';

import { formatAddressLines } from 'src/app/format';
import { queries } from 'src/app/queries';
import { routes } from 'src/app/routes';
import { ApiFailed, QueryResult } from 'src/components/api-result';
import { CommentsSection } from 'src/components/comments-section';
import { BackButton } from 'src/components/link';
import { MessageContent } from 'src/components/message-content';

import { EventNotFound } from '../event-not-found';

import { OrganizerCard } from './organizer';
import { OrganizerActionsCard } from './organizer-actions';
import { Participants } from './participants';
import { ParticipationCard } from './participation';

export function EventPage() {
  const eventId = defined(useParams().eventId);
  const query = useQuery(queries.event(eventId));

  return (
    <div className="stack gap-4">
      <BackButton href={routes.events()}>
        <Trans>Events</Trans>
      </BackButton>

      <QueryResult
        query={query}
        notFound={<EventNotFound />}
        failed={
          <ApiFailed
            title={<Trans>Unable to load the event</Trans>}
            retrying={query.isFetching}
            retry={() => void query.refetch()}
          />
        }
        loading={<EventSkeleton />}
      >
        {(event) => <EventDetails event={event} />}
      </QueryResult>
    </div>
  );
}

// From xl, the aside spans both rows, so that the comments follow the message whatever the aside's height.
function EventDetails({ event }: { event: Event }) {
  const { data: me } = useSuspenseQuery(queries.session());
  const past = event.date !== undefined && isPast(event.date);
  const isOrganizer = event.organizer.id === me.id;

  return (
    <div className="stack gap-6">
      <Header event={event} past={past} />

      <div className="stack gap-6 xl:grid xl:grid-cols-[minmax(0,1fr)_auto] xl:grid-rows-[auto_1fr] xl:items-start xl:gap-x-10">
        <div className="stack max-w-content gap-4">
          <DateAndLocation event={event} />
          <Message event={event} />
        </div>

        <aside className="stack max-w-content gap-6 xl:sticky xl:top-10 xl:col-start-2 xl:row-span-2 xl:row-start-1 xl:w-aside">
          <OrganizerCard event={event} />
          {isOrganizer && <OrganizerActionsCard event={event} />}
          {!past && <ParticipationCard event={event} memberId={me.id} />}
          <Participants participants={event.participants} />
        </aside>

        <div className="max-w-content">
          <CommentsSection entityType="event" entityId={event.id} />
        </div>
      </div>
    </div>
  );
}

function Header({ event, past }: { event: Event; past: boolean }) {
  const external = event.kind === EventKind.external;

  return (
    <header className="stack gap-2">
      <h1 className="text-title-1">{event.title}</h1>

      {(external || past) && (
        <div className="row flex-wrap gap-2">
          {external && (
            <Badge tone="accent">
              <Trans>Outside event</Trans>
            </Badge>
          )}

          {past && (
            <Badge tone="neutral">
              <Trans>Past event</Trans>
            </Badge>
          )}
        </div>
      )}
    </header>
  );
}

function DateAndLocation({ event }: { event: Event }) {
  const { i18n } = useLingui();

  return (
    <Card.Root>
      <Card.Body className="stack gap-4">
        <div className="row items-start gap-3">
          <Icon name="time" className="text-subtle" />
          {event.date === undefined ? (
            <p className="text-muted">
              <Trans>Date to be defined</Trans>
            </p>
          ) : (
            <time dateTime={event.date} className="font-medium first-letter:uppercase">
              {formatDate(new Date(event.date), i18n.locale)}
            </time>
          )}
        </div>

        <div className="row items-start gap-3">
          <Icon name="location" className="text-subtle" />
          {event.location === undefined ? (
            <p className="text-muted">
              <Trans>Location to be defined</Trans>
            </p>
          ) : (
            <address className="wrap-break-word whitespace-pre-line not-italic">
              {formatAddressLines(event.location).join('\n')}
            </address>
          )}
        </div>
      </Card.Body>
    </Card.Root>
  );
}

function Message({ event }: { event: Event }) {
  return (
    <Card.Root>
      <Card.Body>
        <MessageContent message={event.message} />
      </Card.Body>
    </Card.Root>
  );
}

export function formatDate(date: Date, locale: string, now = new Date()) {
  return date.toLocaleString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: date.getFullYear() === now.getFullYear() ? undefined : 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function EventSkeleton() {
  return (
    <div aria-busy className="stack gap-6">
      <Skeleton className="h-8 w-2/3" />

      <div className="stack max-w-content gap-4">
        <Card.Root>
          <Card.Body className="stack gap-3">
            <Skeleton className="w-1/2" />
            <Skeleton className="w-1/3" />
          </Card.Body>
        </Card.Root>

        <Card.Root>
          <Card.Body className="stack gap-3">
            <Skeleton />
            <Skeleton />
            <Skeleton className="w-1/2" />
          </Card.Body>
        </Card.Root>
      </div>
    </div>
  );
}
