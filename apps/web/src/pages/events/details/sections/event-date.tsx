import { Event } from '@sel/shared';
import { Show } from 'solid-js';

import { Card, card } from 'src/components/card';
import { FormattedDate } from 'src/intl/formatted';
import { createTranslate } from 'src/intl/translate';

const T = createTranslate('pages.events.details.date');

export function EventDate(props: { event: Event }) {
  return (
    <Card title={<T id="title" />} classes={{ content: 'py-8 text-center' }}>
      <Show
        when={props.event.date}
        fallback={
          <div class={card.fallback()}>
            <T id="empty" />
          </div>
        }
      >
        <div class="text-xl font-semibold">
          <FormattedDate date={props.event.date} dateStyle="full" />
        </div>
        <div class="text-lg">
          <FormattedDate date={props.event.date} timeStyle="short" />
        </div>
      </Show>
    </Card>
  );
}
