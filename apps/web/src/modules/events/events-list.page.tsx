import { createForm } from '@felte/solid';
import { EventKind, EventsListItem } from '@sel/shared';
import { isSameDay } from '@sel/utils';
import { createQuery } from '@tanstack/solid-query';
import { For } from 'solid-js';

import { Breadcrumb, breadcrumb } from '../../components/breadcrumb';
import { LinkButton } from '../../components/button';
import { Calendar } from '../../components/calendar';
import { Link } from '../../components/link';
import { MonthYearPicker } from '../../components/month-year-picker';
import { container } from '../../infrastructure/container';
import { Translate } from '../../intl/translate';
import { routes } from '../../routes';
import { TOKENS } from '../../tokens';

import { EventsList } from './components/events-list';

const T = Translate.prefix('events.list');

export default function EventsListPage() {
  const api = container.resolve(TOKENS.api);

  const query = createQuery(() => ({
    queryKey: ['listEvents'],
    queryFn: () => api.listEvents({}),
  }));

  // @ts-expect-error solidjs directive
  const { form, data, setFields } = createForm({
    initialValues: {
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
    },
  });

  return (
    <>
      <Breadcrumb items={[breadcrumb.events()]} />

      <div class="mb-8 hidden md:block">
        <div class="mb-6 grid grid-cols-3">
          <div />

          <form use:form class="row items-center justify-center gap-4">
            <MonthYearPicker
              month={data('month')}
              onMonthChange={(month) => setFields('month', month)}
              year={data('year')}
              onYearChange={(year) => setFields('year', year)}
            />
          </form>

          <div class="row items-start justify-end">
            <LinkButton href={routes.events.create}>
              <T id="create" />
            </LinkButton>
          </div>
        </div>

        <Calendar
          year={data('year')}
          month={data('month')}
          renderDay={(date) => (
            <CalendarDay
              date={date}
              events={query.data?.filter((event) => event.date !== undefined && isSameDay(date, event.date))}
            />
          )}
        />
      </div>

      <div class="col gap-8">
        <div class="row items-start justify-between">
          <h1>
            <T id="title" />
          </h1>

          <LinkButton href={routes.events.create} class="md:hidden">
            <T id="create" />
          </LinkButton>
        </div>

        <EventsList events={query.data ?? []} />
      </div>
    </>
  );
}

function CalendarDay(props: { date: Date; events?: EventsListItem[] }) {
  return (
    <div class="h-32 p-2 text-sm">
      <div class="mb-2 font-medium">{props.date.getDate()}</div>

      <For each={props.events}>
        {(event) => (
          <Link
            unstyled
            href={routes.events.details(event.id)}
            class={event.kind === EventKind.internal ? 'text-blue-500' : 'text-yellow-600'}
          >
            {event.title}
          </Link>
        )}
      </For>
    </div>
  );
}
