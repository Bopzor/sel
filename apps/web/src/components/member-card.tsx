import { Member } from '@sel/shared';
import clsx from 'clsx';
import { Icon } from 'solid-heroicons';
import { envelope, phone } from 'solid-heroicons/solid';
import { For, Show } from 'solid-js';

import { isAuthenticatedMember } from '../app-context';
import { Translate } from '../intl/translate';
import { routes } from '../routes';
import { formatPhoneNumber } from '../utils/format-phone-number';

import { Button } from './button';
import { Link } from './link';
import { MemberAvatarName } from './member-avatar-name';

const T = Translate.prefix('common.memberCard');

type MemberCardProps = {
  inline?: boolean;
  member: Pick<Member, 'id' | 'firstName' | 'lastName' | 'email' | 'phoneNumbers'>;
  class?: string;
};

export function MemberCard(props: MemberCardProps) {
  return (
    <div class={clsx('card col gap-4 p-4', props.class)}>
      <Link
        unstyled
        href={routes.members.member(props.member.id)}
        class="items-center gap-2"
        classList={{
          row: props.inline,
          col: !props.inline,
        }}
      >
        <MemberAvatarName
          member={props.member}
          classes={{ avatar: clsx(!props.inline && '!size-24'), name: 'text-lg' }}
        />
      </Link>

      <ul class="col gap-1">
        <PhoneNumbers member={props.member} />
        <Email member={props.member} />
      </ul>

      <Show when={!isAuthenticatedMember(props.member)}>
        <Button variant="secondary" class="hidden self-start">
          <T id="contact" values={{ member: props.member.firstName }} />
        </Button>
      </Show>
    </div>
  );
}

function PhoneNumbers(props: { member: Pick<Member, 'phoneNumbers'> }) {
  return (
    <For each={props.member.phoneNumbers}>
      {({ number }) => (
        <li class="row items-center gap-2">
          <Icon class="size-4 text-icon" path={phone} />

          <a class="unstyled" href={`tel:${number}`}>
            {formatPhoneNumber(number)}
          </a>
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
          <Icon class="size-4 text-icon" path={envelope} />

          <a class="unstyled" href={`mailto:${email()}`}>
            {email()}
          </a>
        </li>
      )}
    </Show>
  );
}
