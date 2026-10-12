import { Trans, useLingui } from '@lingui/react/macro';
import type { EventsListItem } from '@sel/shared';
import { Card, Icon, ListItem } from '@sel/ui';
import { defined } from '@sel/utils';
import { useQuery } from '@tanstack/react-query';

import { queries } from 'src/app/queries';
import { routes } from 'src/app/routes';
import { Bullet } from 'src/components/bullet';
import { DateIcon } from 'src/components/date-icon';
import { Link } from 'src/components/link';

export function UpcomingEventsCard({ className }: { className?: string }) {
  const { data } = useQuery(queries.upcomingEvents());

  if (!data?.total) {
    return null;
  }

  return (
    <Card.Root className={className}>
      <Card.Header compact>
        <Card.Title level={2}>
          <Trans>Upcoming events</Trans>
        </Card.Title>
      </Card.Header>

      <ul className="border-t last-of-type:border-b">
        {data.items.map((event) => (
          <UpcomingEventItem key={event.id} event={event} />
        ))}
      </ul>

      <Card.Footer compact>
        <Link
          href={routes.events()}
          className="row items-center gap-2 text-body-sm font-medium text-muted underline"
        >
          <Trans>See all events</Trans>
          <Icon name="next" size="sm" />
        </Link>
      </Card.Footer>
    </Card.Root>
  );
}

function UpcomingEventItem({ event }: { event: EventsListItem }) {
  const { i18n } = useLingui();
  const date = new Date(defined(event.date));

  return (
    <ListItem.Root>
      <DateIcon date={date} />

      <ListItem.Content>
        <ListItem.Title className="text-body-strong">
          <ListItem.Link Link={Link} href={routes.event(event.id)}>
            {event.title}
          </ListItem.Link>
        </ListItem.Title>

        <ListItem.Description>
          <time dateTime={event.date}>
            <span className="sr-only">{`${date.toLocaleDateString(i18n.locale, { dateStyle: 'long' })} `}</span>
            {date.toLocaleTimeString(i18n.locale, { hour: 'numeric', minute: '2-digit' })}
          </time>

          {event.location && (
            <>
              <Bullet />
              {event.location.city}
            </>
          )}
        </ListItem.Description>
      </ListItem.Content>

      <ListItem.Chevron />
    </ListItem.Root>
  );
}
