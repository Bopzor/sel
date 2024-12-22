import { Member } from '@sel/shared';
import { Icon } from 'solid-heroicons';
import { envelope, phone } from 'solid-heroicons/solid';
import { For, Show } from 'solid-js';

import { FormattedPhoneNumber } from 'src/intl/formatted';

import { ExternalLink } from './link';

export function MemberContactInfo(props: { member: Pick<Member, 'phoneNumbers' | 'email'> }) {
  return (
    <ul class="col gap-1">
      <PhoneNumbers member={props.member} />
      <Email member={props.member} />
    </ul>
  );
}

function PhoneNumbers(props: { member: Pick<Member, 'phoneNumbers'> }) {
  return (
    <For each={props.member.phoneNumbers}>
      {({ number }) => (
        <li class="row items-center gap-2">
          <Icon class="size-4 text-dim" path={phone} />

          <ExternalLink href={`tel:${number}`}>
            <FormattedPhoneNumber phoneNumber={number} />
          </ExternalLink>
        </li>
      )}
    </For>
  );
}

function Email(props: { member: Pick<Member, 'email'> }) {
  return (
    <Show when={props.member.email}>
      {(email) => (
        <li class="row items-center gap-2">
          <Icon class="size-4 text-dim" path={envelope} />

          <ExternalLink href={`mailto:${email()}`}>{email()}</ExternalLink>
        </li>
      )}
    </Show>
  );
}
