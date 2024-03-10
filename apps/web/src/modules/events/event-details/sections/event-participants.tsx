import { Event } from '@sel/shared';
import { hasProperty } from '@sel/utils';
import { For } from 'solid-js';

import { Link } from '../../../../components/link';
import { MemberAvatarName } from '../../../../components/member-avatar-name';
import { Translate } from '../../../../intl/translate';
import { routes } from '../../../../routes';

const T = Translate.prefix('events');

export function EventParticipants(props: { event: Event }) {
  const participants = () => props.event.participants.filter(hasProperty('participation', 'yes'));

  return (
    <div>
      <h2 class="mb-4">
        <T id="participantsTitle" values={{ count: participants().length }} />
      </h2>

      <ul class="col gap-2">
        <For each={participants()}>
          {(participant) => (
            <li>
              <Link unstyled class="row items-center gap-2" href={routes.members.member(participant.id)}>
                <MemberAvatarName member={participant} />
              </Link>
            </li>
          )}
        </For>
      </ul>
    </div>
  );
}
