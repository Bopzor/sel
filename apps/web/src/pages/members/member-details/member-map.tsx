import { Member } from '@sel/shared';
import { Show } from 'solid-js';

import { Map } from 'src/components/map';

export function MemberMap(props: { member: Member }) {
  return (
    <Show when={props.member.address?.position}>
      {(position) => (
        <Map
          center={position()}
          zoom={13}
          class="min-h-96 flex-1"
          markers={[{ position: position(), isPopupOpen: false }]}
        />
      )}
    </Show>
  );
}
