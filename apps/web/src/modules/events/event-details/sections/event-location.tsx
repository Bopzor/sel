import { Event } from '@sel/shared';

import { Map } from '../../../../components/map';

export function EventLocation(props: { event: Event }) {
  return (
    <div class="card p-4">
      <Map
        zoom={13}
        class="h-48 flex-1"
        markers={[{ position: [5.042, 43.836], isPopupOpen: false }]}
        center={[5.042, 43.836]}
      />

      <div class="mt-4">{props.event.location}</div>
    </div>
  );
}
