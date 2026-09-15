import { Member } from '@sel/shared';
import { Icon } from 'solid-heroicons';
import { envelope, phone } from 'solid-heroicons/solid';
import { Show } from 'solid-js';

import { FormattedPhoneNumber } from 'src/intl/formatted';

import { ExternalLink } from './link';

export function MemberContactInfo(props: { member: Pick<Member, 'phoneNumber' | 'email'> }) {
  return (
    <ul class="col gap-1">
      <PhoneNumber member={props.member} />
      <Email member={props.member} />
    </ul>
  );
}

function PhoneNumber(props: { member: Pick<Member, 'phoneNumber'> }) {
  return (
    <Show when={props.member.phoneNumber}>
      {(number) => (
        <li class="row items-center gap-2">
          <Icon class="size-4 text-dim" path={phone} />

          <ExternalLink href={`tel:${number()}`}>
            <FormattedPhoneNumber phoneNumber={number()} />
          </ExternalLink>
        </li>
      )}
    </Show>
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
