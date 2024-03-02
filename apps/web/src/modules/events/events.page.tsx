import { createForm } from '@felte/solid';
import { createArray } from '@sel/utils';
import { For } from 'solid-js';

import { BackLink } from '../../components/back-link';
import { Calendar } from '../../components/calendar';
import { Input } from '../../components/input';
import { FormattedDate } from '../../intl/formatted';
import { routes } from '../../routes';

export default function EventsPage() {
  // @ts-expect-error solidjs directive
  const { form, data } = createForm({
    initialValues: {
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
    },
  });

  return (
    <div>
      <BackLink href={routes.home} />

      <form use:form class="row mb-6 items-center justify-center gap-4">
        <select name="month" class="capitalize">
          <For each={createArray(12, (index) => index + 1)}>
            {(month) => (
              <option value={month} class="capitalize">
                <FormattedDate date={new Date(2024, month - 1)} month="long" />
              </option>
            )}
          </For>
        </select>

        <Input name="year" type="number" width="small" value={2024} />
      </form>

      <Calendar year={data('year')} month={data('month')} />
    </div>
  );
}
