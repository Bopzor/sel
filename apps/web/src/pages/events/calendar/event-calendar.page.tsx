import { EventsListItem } from '@sel/shared';
import { isSameDay, isToday, startOfMonth } from '@sel/utils';
import { useQuery } from '@tanstack/solid-query';
import clsx from 'clsx';
import { add, sub } from 'date-fns';
import { Icon } from 'solid-heroicons';
import { chevronLeft, chevronRight } from 'solid-heroicons/solid';
import { createSignal, For } from 'solid-js';

import { apiQuery } from 'src/application/query';
import { routes } from 'src/application/routes';
import { LinkButton } from 'src/components/button';
import { Calendar } from 'src/components/calendar';
import { Link } from 'src/components/link';
import { Query } from 'src/components/query';
import { BoxSkeleton, TextSkeleton } from 'src/components/skeleton';
import { useIntl } from 'src/intl/intl-provider';
import { createTranslate } from 'src/intl/translate';

const T = createTranslate('pages.events.calendar');

export function EventCalendarPage() {
  const [month, setMonth] = createSignal(startOfMonth(new Date()));

  const query = useQuery(() =>
    apiQuery('listEvents', {
      query: {
        pageSize: 100,
        year: month().getFullYear(),
      },
    }),
  );

  return (
    <>
      <div class="mb-8 row items-center justify-between gap-4">
        <h1>
          <T id="title" />
        </h1>

        <LinkButton href={routes.events.create}>
          <T id="createEvent" />
        </LinkButton>
      </div>

      <Query query={query} pending={<Skeleton />}>
        {(events) => (
          <div class="col flex-1 gap-4">
            <MonthSelector
              month={month()}
              previous={() => setMonth(sub(month(), { months: 1 }))}
              next={() => setMonth(add(month(), { months: 1 }))}
            />

            <Calendar
              month={month().getMonth() + 1}
              year={month().getFullYear()}
              renderDay={(date) => <Day events={events().items} date={date} />}
            />
          </div>
        )}
      </Query>
    </>
  );
}

function Skeleton() {
  return (
    <div class="col items-center gap-8">
      <TextSkeleton width={20} />
      <BoxSkeleton height={32} />
    </div>
  );
}

function MonthSelector(props: { month: Date; previous: () => void; next: () => void }) {
  const intl = useIntl();

  return (
    <div class="row justify-center gap-6 text-xl capitalize">
      <button type="button" class="px-2" onClick={() => props.previous()}>
        <Icon path={chevronLeft} class="size-5 text-dim" />
      </button>

      <div class="min-w-40 text-center">
        {intl.formatDate(props.month, { month: 'long' })} {props.month.getFullYear()}
      </div>

      <button type="button" class="px-2" onClick={() => props.next()}>
        <Icon path={chevronRight} class="size-5 text-dim" />
      </button>
    </div>
  );
}

function Day(props: { events: EventsListItem[]; date: Date }) {
  const events = () => props.events.filter((event) => event.date && isSameDay(props.date, event.date));

  return (
    <div class={clsx('col h-24 gap-2 p-2', isToday(props.date) && 'shadow-current-day')}>
      <div>{props.date.getDate()}</div>
      <For each={events()}>
        {(event) => (
          <Link href={routes.events.details(event.id)} class="line-clamp-2 text-xs">
            {event.title}
          </Link>
        )}
      </For>
    </div>
  );
}
