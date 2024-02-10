import { Member } from '@sel/shared';
import { Show } from 'solid-js';

import { Map } from '../../../components/map';

export function MemberMap(props: { member: Member }) {
  return (
    <Show when={props.member.address?.position}>
      {(position) => (
        <Map
          center={position()}
          zoom={13}
          class="max-h-md min-h-sm flex-1"
          markers={[{ position: position(), isPopupOpen: false }]}
        />
      )}
    </Show>
  );
}
