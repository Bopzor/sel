import { createForm } from '@felte/solid';
import { Event, EventKind } from '@sel/shared';
import { createArray } from '@sel/utils';
import { createResource } from 'solid-js';

import { Breadcrumb, breadcrumb } from '../../components/breadcrumb';
import { Calendar, CalendarEvent } from '../../components/calendar';
import { Input } from '../../components/input';
import { Select } from '../../components/select';
import { container } from '../../infrastructure/container';
import { FormattedDate } from '../../intl/formatted';
import { routes } from '../../routes';
import { TOKENS } from '../../tokens';

type EventWithDate = Event & {
  date: string;
};

export default function EventsListPage() {
  const eventsApi = container.resolve(TOKENS.eventApi);

  const [events] = createResource(async () => {
    return eventsApi.listEvents();
  });

  const eventsWithDate = () => {
    return events()?.filter(hasDate);
  };

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

      <form use:form class="row mb-6 items-center justify-center gap-4">
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

      <Calendar year={data('year')} month={data('month')} events={eventsWithDate()?.map(eventToCalendar)} />
    </div>
  );
}

function hasDate(value: Event): value is EventWithDate {
  return 'date' in value;
}

function eventToCalendar(event: Event & { date: string }): CalendarEvent {
  return {
    date: new Date(event.date),
    title: event.title,
    class: event.kind === EventKind.internal ? 'text-blue-500' : 'text-yellow-600',
    link: routes.events.details(event.id),
  };
}
