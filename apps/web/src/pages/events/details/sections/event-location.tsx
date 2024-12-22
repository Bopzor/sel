import { Event } from '@sel/shared';
import { Show } from 'solid-js';

import { Card } from 'src/components/card';
import { ExternalLink } from 'src/components/link';
import { Map } from 'src/components/map';
import { formatAddressInline, FormattedAddress } from 'src/intl/formatted';
import { createTranslate } from 'src/intl/translate';

const T = createTranslate('pages.events.details.location');

export function EventLocation(props: { event: Event }) {
  return (
    <Card title={<T id="title" />}>
      <Show
        when={props.event.location}
        fallback={
          <div class="col gap-4 text-center text-lg font-semibold text-dim">
            <Map class="pointer-events-none min-h-48 w-full opacity-75 grayscale" />
            <T id="empty" />
          </div>
        }
      >
        {(location) => (
          <div class="col gap-4">
            <Map
              class="min-h-48"
              center={location().position}
              zoom={13}
              markers={[{ position: location().position! }]}
            />

            <ExternalLink
              openInNewTab
              href={`https://www.openstreetmap.org/search?query=${formatAddressInline(location())}`}
              class="whitespace-pre"
            >
              <FormattedAddress address={location()} />
            </ExternalLink>
          </div>
        )}
      </Show>
    </Card>
  );
}
