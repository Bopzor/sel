import { createForm } from '@felte/solid';
import { createArray } from '@sel/utils';

import { BackLink } from '../../components/back-link';
import { Calendar } from '../../components/calendar';
import { Input } from '../../components/input';
import { Select } from '../../components/select';
import { FormattedDate } from '../../intl/formatted';
import { routes } from '../../routes';

export default function EventsPage() {
  // @ts-expect-error solidjs directive
  const { form, data, setFields } = createForm({
    initialValues: {
      year: new Date().getFullYear(),
      month: new Date().getMonth(),
    },
  });

  return (
    <div>
      <BackLink href={routes.home} />

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

      <Calendar year={data('year')} month={data('month')} />
    </div>
  );
}
