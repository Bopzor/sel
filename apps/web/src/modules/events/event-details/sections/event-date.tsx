import { Event } from '@sel/shared';
import { Show } from 'solid-js';

import { FormattedDate } from '../../../../intl/formatted';
import { Translate } from '../../../../intl/translate';

const T = Translate.prefix('events');

export function EventDate(props: { event: Event }) {
  return (
    <div class="card px-4 py-8">
      <Show when={props.event.date} fallback={<NoDate />}>
        <div class="text-center text-xl font-semibold">
          <FormattedDate date={props.event.date} dateStyle="full" />
        </div>

        <div class="text-center text-lg">
          <FormattedDate date={props.event.date} timeStyle="short" />
        </div>
      </Show>
    </div>
  );
}

function NoDate() {
  return (
    <div class="text-center text-lg font-semibold text-dim">
      <T id="dateToBeDefined" />
    </div>
  );
}
