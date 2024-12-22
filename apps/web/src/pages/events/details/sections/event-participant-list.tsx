import { Event } from '@sel/shared';
import { hasProperty } from '@sel/utils';
import { For } from 'solid-js';

import { Card, CardFallback } from 'src/components/card';
import { MemberAvatarName } from 'src/components/member-avatar-name';
import { createTranslate } from 'src/intl/translate';

const T = createTranslate('pages.events.details.participants');

export function EventParticipantList(props: { event: Event }) {
  const participants = () => props.event.participants.filter(hasProperty('participation', 'yes'));

  return (
    <Card title={<T id="title" values={{ count: participants().length }} />}>
      <ul class="col gap-2">
        <For
          each={participants()}
          fallback={
            <CardFallback>
              <T id="empty" />
            </CardFallback>
          }
        >
          {(participant) => (
            <li>
              <MemberAvatarName member={participant} />
            </li>
          )}
        </For>
      </ul>
    </Card>
  );
}
