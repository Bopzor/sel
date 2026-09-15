import { Member } from '@sel/shared';
import { defined, formatDateRelative } from '@sel/utils';
import { Icon } from 'solid-heroicons';
import { clock, envelope, home, phone, user } from 'solid-heroicons/solid';
import { ComponentProps, JSX, Show } from 'solid-js';

import { getIsAuthenticatedMember } from 'src/application/query';
import { LinkButton } from 'src/components/button';
import { ExternalLink } from 'src/components/link';
import { FormattedAddress, FormattedPhoneNumber } from 'src/intl/formatted';
import { createTranslate } from 'src/intl/translate';

const T = createTranslate('pages.members.details');

export function ContactInformation(props: { member: Member }) {
  const isAuthenticatedMember = getIsAuthenticatedMember();

  return (
    <div class="col gap-4">
      <Show when={isAuthenticatedMember(props.member)}>
        <LinkButton href="/profile" variant="outline" class="self-start">
          <T id="editProfile" />
        </LinkButton>
      </Show>

      <PhoneNumber member={props.member} />
      <Email member={props.member} />
      <Address member={props.member} />
      <MembershipDate member={props.member} />
      <MemberNumber member={props.member} />
    </div>
  );
}

function PhoneNumber(props: { member: Member }) {
  return (
    <MemberData when={props.member.phoneNumber} label={<T id="phoneNumber" />} icon={phone}>
      <ExternalLink href={`tel:${defined(props.member.phoneNumber)}`}>
        <FormattedPhoneNumber phoneNumber={defined(props.member.phoneNumber)} />
      </ExternalLink>
    </MemberData>
  );
}

function Email(props: { member: Member }) {
  return (
    <MemberData when={props.member.email} label={<T id="emailAddress" />} icon={envelope}>
      <ExternalLink href={`mailto:${props.member.email}`}>{props.member.email}</ExternalLink>
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
      <T
        id="membershipDateFormatted"
        values={{
          date: new Date(props.member.membershipStartDate),
          relative: formatDateRelative(props.member.membershipStartDate),
          dim: (children) => <span class="text-sm text-dim">{children}</span>,
        }}
      />
    </MemberData>
  );
}

function MemberNumber(props: { member: Member }) {
  return (
    <MemberData when={props.member.membershipStartDate} label={<T id="memberNumber" />} icon={user}>
      {props.member.number}
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
        <div class="mb-2 text-primary">
          <Icon path={props.icon} class="inline-block h-em" />
          <span class="ml-2 align-middle font-semibold">{props.label}</span>
        </div>

        {props.children}
      </div>
    </Show>
  );
}
