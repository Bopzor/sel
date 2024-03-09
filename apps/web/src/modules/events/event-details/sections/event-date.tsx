import { Event } from '@sel/shared';

import { FormattedDate } from '../../../../intl/formatted';

export function EventDate(props: { event: Event }) {
  return (
    <div class="card px-4 py-8">
      <div class="text-center text-xl font-semibold">
        <FormattedDate date={props.event.date} dateStyle="full" />
      </div>

      <div class="text-center text-lg">
        <FormattedDate date={props.event.date} timeStyle="short" />
      </div>
    </div>
  );
}
