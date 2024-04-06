import { EventsListItem } from '@sel/shared';
import { For, Show } from 'solid-js';

import { Link } from '../../../components/link';
import { FormattedDate } from '../../../intl/formatted';
import { Translate } from '../../../intl/translate';
import { routes } from '../../../routes';

const T = Translate.prefix('events.list');

export function EventsList(props: { events: EventsListItem[] }) {
  return (
    <div class="card max-w-4xl divide-y px-8 py-4">
      <For
        each={props.events}
        fallback={
          <div class="fallback min-h-32">
            <T id="empty" />
          </div>
        }
      >
        {(event) => (
          <Link href={routes.events.details(event.id)} unstyled class="block py-4">
            <div class="row justify-between">
              <div class="text-lg font-semibold">{event.title}</div>
              <div class="hidden text-sm md:block">
                <T id="organizerLabel" />{' '}
                <span class="font-medium">
                  {event.organizer.firstName} {event.organizer.lastName}
                </span>
              </div>
            </div>

            <div class="row gap-4">
              <Show
                when={event.date}
                fallback={
                  <div class="italic text-dim">
                    <T id="noDateFallback" />
                  </div>
                }
              >
                {(date) => <FormattedDate date={date()} dateStyle="full" timeStyle="short" />}
              </Show>
            </div>
          </Link>
        )}
      </For>
    </div>
  );
}
