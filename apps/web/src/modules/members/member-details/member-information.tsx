import { Member } from '@sel/shared';
import { defined, formatDateRelative } from '@sel/utils';
import { Icon } from 'solid-heroicons';
import { clock, envelope, home, phone, user } from 'solid-heroicons/solid';
import { ComponentProps, For, JSX, Show } from 'solid-js';

import { FormattedAddress } from '../../../components/formatted-address';
import { Translate } from '../../../intl/translate';
import { formatPhoneNumber } from '../../../utils/format-phone-number';

const T = Translate.prefix('members');

export function MemberInformation(props: { member: Member }) {
  return (
    <div class="col gap-4">
      <PhoneNumbers member={props.member} />
      <Email member={props.member} />
      <Address member={props.member} />
      <MembershipDate member={props.member} />
      <Bio member={props.member} />
    </div>
  );
}

function PhoneNumbers(props: { member: Member }) {
  return (
    <MemberData
      when={props.member && props.member.phoneNumbers.length > 0}
      label={<T id="phoneNumber" />}
      icon={phone}
    >
      <ul>
        <For each={props.member.phoneNumbers}>
          {({ number }) => (
            <li>
              <a class="unstyled" href={`tel:${number}`}>
                {formatPhoneNumber(number)}
              </a>
            </li>
          )}
        </For>
      </ul>
    </MemberData>
  );
}

function Email(props: { member: Member }) {
  return (
    <MemberData when={props.member.email} label={<T id="emailAddress" />} icon={envelope}>
      <a class="unstyled" href={`mailto:${props.member.email}`}>
        {props.member.email}
      </a>
    </MemberData>
  );
}

function Address(props: { member: Member }) {
  return (
    <MemberData when={props.member.address} label={<T id="mailingAddress" />} icon={home}>
      <FormattedAddress address={defined(props.member.address)} />
    </MemberData>
  );
}

function MembershipDate(props: { member: Member }) {
  return (
    <MemberData when={props.member.membershipStartDate} label={<T id="membershipDate" />} icon={clock}>
      <p>
        <T
          id="membershipDateFormatted"
          values={{
            date: new Date(props.member.membershipStartDate),
            relative: formatDateRelative(props.member.membershipStartDate),
            dim: (children) => <span class="text-sm text-dim">{children}</span>,
          }}
        />
      </p>
    </MemberData>
  );
}

function Bio(props: { member: Member }) {
  return (
    <MemberData when={props.member.bio} label={<T id="bio" />} icon={user}>
      <p>{props.member.bio}</p>
    </MemberData>
  );
}

type MemberDataProps = {
  when: unknown;
  icon: ComponentProps<typeof Icon>['path'];
  label: JSX.Element;
  children: JSX.Element;
};

function MemberData(props: MemberDataProps) {
  return (
    <Show when={props.when}>
      <div>
        <div class="mb-2 text-primary dark:text-blue-400">
          <Icon path={props.icon} class="inline-block h-em" />
          <span class="ml-2 align-middle font-semibold">{props.label}</span>
        </div>

        {props.children}
      </div>
    </Show>
  );
}
