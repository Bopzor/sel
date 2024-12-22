import { Event } from '@sel/shared';

import { Card } from 'src/components/card';
import { MemberAvatarName } from 'src/components/member-avatar-name';
import { MemberContactInfo } from 'src/components/member-contact-info';
import { createTranslate } from 'src/intl/translate';

const T = createTranslate('pages.events.details.organizer');

export function EventOrganizer(props: { event: Event }) {
  return (
    <Card title={<T id="title" />} class="col gap-4">
      <MemberAvatarName member={props.event.organizer} />
      <MemberContactInfo member={props.event.organizer} />
    </Card>
  );
}
