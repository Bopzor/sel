import { Event } from '@sel/shared';
import { hasProperty } from '@sel/utils';

import { card, Card } from 'src/components/card';
import { List } from 'src/components/list';
import { MemberAvatarName } from 'src/components/member-avatar-name';
import { createTranslate } from 'src/intl/translate';

const T = createTranslate('pages.events.details.participants');

export function EventParticipantList(props: { event: Event }) {
  const participants = () => props.event.participants.filter(hasProperty('participation', 'yes'));

  return (
    <Card title={<T id="title" values={{ count: participants().length }} />}>
      <List
        each={participants()}
        fallback={
          <div class={card.fallback()}>
            <T id="empty" />
          </div>
        }
        class="col gap-2"
      >
        {(participant) => (
          <li>
            <MemberAvatarName member={participant} />
          </li>
        )}
      </List>
    </Card>
  );
}
