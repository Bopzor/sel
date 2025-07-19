import { EventsListItem } from '@sel/shared';
import { isAfter, isSameDay, isToday, startOfMonth } from '@sel/utils';
import { useQuery } from '@tanstack/solid-query';
import clsx from 'clsx';
import { add, sub } from 'date-fns';
import { Icon } from 'solid-heroicons';
import { chevronLeft, chevronRight } from 'solid-heroicons/solid';
import { createSignal, For, Show } from 'solid-js';

import { apiQuery } from 'src/application/query';
import { routes } from 'src/application/routes';
import { breadcrumb, Breadcrumb } from 'src/components/breadcrumb';
import { LinkButton } from 'src/components/button';
import { Calendar } from 'src/components/calendar';
import { Card, CardFallback } from 'src/components/card';
import { Link } from 'src/components/link';
import { BoxSkeleton } from 'src/components/skeleton';
import { FormattedDate } from 'src/intl/formatted';
import { useIntl } from 'src/intl/intl-provider';
import { createTranslate } from 'src/intl/translate';

const T = createTranslate('pages.events.list');

export function EventListPage() {
  const query = useQuery(() => apiQuery('listEvents', {}));

  const [month, setMonth] = createSignal(startOfMonth(new Date()));
  const [tab, setTab] = createSignal<'upcoming' | 'past'>('upcoming');

  const filterEvents = (events: EventsListItem[]) => {
    if (tab() === 'upcoming') {
      return events.filter(upcomingEventPredicate);
    } else {
      return events.filter(pastEventPredicate).reverse();
    }
  };

  return (
    <>
      <Breadcrumb items={[breadcrumb.events()]} />

      <div class="mb-8 row items-center justify-between gap-4">
        <h1>
          <T id="title" />
        </h1>

        <LinkButton href={routes.events.create}>
          <T id="createEvent" />
        </LinkButton>
      </div>

      <Show when={query.data} fallback={<Skeleton />}>
        {(events) => (
          <div class="row gap-8">
            <div class="flex-1 lg:max-w-96">
              <div role="tablist" class="mb-4 row flex-wrap justify-evenly gap-2 text-lg text-dim">
                <button
                  type="button"
                  role="tab"
                  class={clsx(tab() === 'upcoming' && 'font-bold')}
                  onClick={() => setTab('upcoming')}
                >
                  <T id="upcoming" />
                </button>
                <button
                  type="button"
                  role="tab"
                  class={clsx(tab() === 'past' && 'font-bold')}
                  onClick={() => setTab('past')}
                >
                  <T id="past" />
                </button>
              </div>

              <Card>
                <ul>
                  <For
                    each={filterEvents(events())}
                    fallback={<CardFallback>{<T id="empty" />}</CardFallback>}
                  >
                    {(event) => <EventItem event={event} class="rounded-md p-2 hover:bg-primary/5" />}
                  </For>
                </ul>
              </Card>
            </div>

            <div class="hidden flex-1 gap-4 lg:col">
              <MonthSelector
                month={month()}
                previous={() => setMonth(sub(month(), { months: 1 }))}
                next={() => setMonth(add(month(), { months: 1 }))}
              />

              <Calendar
                month={month().getMonth() + 1}
                year={month().getFullYear()}
                renderDay={(date) => <Day events={events()} date={date} />}
              />
            </div>
          </div>
        )}
      </Show>
    </>
  );
}

function Skeleton() {
  return (
    <>
      <div class="max-w-4xl xl:hidden">
        <BoxSkeleton height={16} />
      </div>

      <div class="hidden gap-4 xl:row">
        <div class="w-full max-w-80">
          <BoxSkeleton height={24} />
        </div>

        <BoxSkeleton height={32} />
      </div>
    </>
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
          <Link href={routes.events.details(event.id)} class="text-xs">
            {event.title}
          </Link>
        )}
      </For>
    </div>
  );
}

function EventItem(props: { event: EventsListItem; class?: string }) {
  return (
    <li class={props.class}>
      <Link href={routes.events.details(props.event.id)}>
        <div class="text-sm text-dim">
          <Show when={props.event.date} fallback={<T id="noDate" />}>
            <FormattedDate date={props.event.date} dateStyle="medium" timeStyle="short" />
          </Show>
        </div>

        <div class="font-medium">{props.event.title}</div>
      </Link>
    </li>
  );
}

function upcomingEventPredicate(event: EventsListItem) {
  if (!event.date) {
    return true;
  }

  if (isToday(event.date)) {
    return true;
  }

  return isAfter(event.date, new Date());
}

function pastEventPredicate(event: EventsListItem) {
  return !upcomingEventPredicate(event);
}
