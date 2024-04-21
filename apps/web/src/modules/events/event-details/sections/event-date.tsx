import { Event } from '@sel/shared';
import { Show } from 'solid-js';

import { FormattedDate } from '../../../../intl/formatted';
import { Translate } from '../../../../intl/translate';

const T = Translate.prefix('events.details');

export function EventDate(props: { event: Event }) {
  return (
    <div class="col card items-center justify-center px-4 py-8 text-center">
      <Show when={props.event.date} fallback={<NoDate />}>
        <div class="text-xl font-semibold">
          <FormattedDate date={props.event.date} dateStyle="full" />
        </div>

        <div class="text-lg">
          <FormattedDate date={props.event.date} timeStyle="short" />
        </div>
      </Show>
    </div>
  );
}

function NoDate() {
  return (
    <div class="text-lg font-semibold text-dim">
      <T id="dateToBeDefined" />
    </div>
  );
}
