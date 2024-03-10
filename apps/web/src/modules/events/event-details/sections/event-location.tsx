import { Event } from '@sel/shared';
import { Show } from 'solid-js';

import { FormattedAddress } from '../../../../components/formatted-address';
import { Map } from '../../../../components/map';
import { Translate } from '../../../../intl/translate';

const T = Translate.prefix('events');

export function EventLocation(props: { event: Event }) {
  return (
    <div class="card p-4">
      <Show when={props.event.location} fallback={<NoLocation />}>
        {(location) => (
          <>
            <Show when={location().position}>
              {(position) => (
                <Map
                  zoom={12}
                  class="h-48"
                  markers={[{ position: position(), isPopupOpen: false }]}
                  center={position()}
                />
              )}
            </Show>

            <div class="mt-4">
              <FormattedAddress address={location()} />
            </div>
          </>
        )}
      </Show>
    </div>
  );
}

function NoLocation() {
  return (
    <>
      <Map zoom={13} class="pointer-events-none h-48 flex-1 opacity-50 grayscale" center={[5.042, 43.836]} />

      <div class="mt-4 text-center text-lg font-semibold text-dim">
        <T id="locationToBeDefined" />
      </div>
    </>
  );
}
