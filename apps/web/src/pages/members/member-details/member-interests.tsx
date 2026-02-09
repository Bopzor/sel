import { Member } from '@sel/shared';
import clsx from 'clsx';

import { List } from 'src/components/list';
import { createTranslate } from 'src/intl/translate';

const T = createTranslate('pages.members.details.interests');

export function MemberInterests(props: { member: Member }) {
  return (
    <List each={props.member.interests}>
      {(interest) => (
        <li class="py-4">
          <strong class="text-lg font-medium">{interest.label}</strong>
          <p class={clsx('text-dim', { italic: !interest.description })}>
            {interest.description ?? <T id="noDescription" />}
          </p>
        </li>
      )}
    </List>
  );
}
