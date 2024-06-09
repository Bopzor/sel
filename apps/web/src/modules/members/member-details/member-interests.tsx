import { Member, MemberInterest } from '@sel/shared';
import { For } from 'solid-js';

import { Translate } from '../../../intl/translate';

const T = Translate.prefix('members.interests');

export function MemberInterests(props: { member: Member }) {
  return (
    <div class="card p-4 md:p-8">
      <div class="sm:row hidden items-start gap-4">
        <div class="w-full max-w-64 text-xs font-medium uppercase text-dim">
          <T id="interest" />
        </div>

        <div class="w-full max-w-64 text-xs font-medium uppercase text-dim">
          <T id="description" />
        </div>
      </div>

      <InterestsList interests={props.member.interests.sort((a, b) => a.label.localeCompare(b.label))} />
    </div>
  );
}

function InterestsList(props: { interests: MemberInterest[] }) {
  return (
    <ul class="divide-y">
      <For each={props.interests}>
        {(interest) => (
          <li class="col sm:row items-start gap-2 py-4 sm:gap-4">
            <strong class="w-full max-w-64 text-lg font-medium">{interest.label}</strong>
            <p class="text-dim">{interest.description}</p>
          </li>
        )}
      </For>
    </ul>
  );
}
