import { createForm } from '@felte/solid';
import { Event, EventKind } from '@sel/shared';
import { createArray, isSameDay } from '@sel/utils';
import { For, createResource } from 'solid-js';

import { Breadcrumb, breadcrumb } from '../../components/breadcrumb';
import { LinkButton } from '../../components/button';
import { Calendar } from '../../components/calendar';
import { Input } from '../../components/input';
import { Link } from '../../components/link';
import { Select } from '../../components/select';
import { container } from '../../infrastructure/container';
import { FormattedDate } from '../../intl/formatted';
import { Translate } from '../../intl/translate';
import { routes } from '../../routes';
import { TOKENS } from '../../tokens';

const T = Translate.prefix('events.list');

export default function EventsListPage() {
  const eventsApi = container.resolve(TOKENS.eventApi);

  const [events] = createResource(async () => {
    return eventsApi.listEvents();
  });

  // @ts-expect-error solidjs directive
  const { form, data, setFields } = createForm({
    initialValues: {
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
    },
  });

  return (
    <div>
      <Breadcrumb items={[breadcrumb.events()]} />

      <div class="mb-6 grid grid-cols-3">
        <div />

        <form use:form class="row items-center justify-center gap-4">
          <Select
            width="small"
            items={createArray(12, (index) => index + 1)}
            itemToString={(date) => String(date)}
            renderItem={(month) => (
              <div class="capitalize">
                <FormattedDate date={new Date(2024, month - 1)} month="long" />
              </div>
            )}
            selectedItem={data('month')}
            onSelect={(month) => setFields('month', month)}
          />
          <Input name="year" type="number" width="small" />
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
            events={events()?.filter((event) => event.date !== undefined && isSameDay(date, event.date))}
          />
        )}
      />
    </div>
  );
}

function CalendarDay(props: { date: Date; events?: Event[] }) {
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
