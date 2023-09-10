import { Member } from '@sel/shared';
import { assert } from '@sel/utils';
import { useParams } from '@solidjs/router';
import { Icon } from 'solid-heroicons';
import { envelope, home, phone, user } from 'solid-heroicons/solid';
import { Component, ComponentProps, For, JSX, ParentProps, Show, createEffect } from 'solid-js';

import { BackLink } from '../components/back-link';
import { Map } from '../components/map';
import { MemberAddress } from '../components/member-address';
import { MemberAvatarName } from '../components/member-avatar-name';
import { Translate } from '../intl/translate';
import { selector } from '../store/selector';
import { store } from '../store/store';

import { selectMemberUnsafe } from './members.slice';
import { fetchMember } from './use-cases/fetch-member/fetch-member';

const T = Translate.prefix('members');

export const MemberPage: Component = () => {
  const { memberId } = useParams<{ memberId: string }>();
  const member = selector((state) => selectMemberUnsafe(state, memberId));

  createEffect(() => {
    if (!member()) {
      void store.dispatch(fetchMember(memberId));
    }
  });

  return (
    <>
      <BackLink href="/membres" />

      <Show when={member()} fallback={<Translate id="common.loading" />}>
        {(member) => (
          <div class="card gap-4 p-8">
            <div class="row items-center gap-2">
              <MemberAvatarName size="large" member={member()} />
            </div>

            <hr class="my-6" />

            <div class="grid grid-cols-1 gap-8 md:grid-cols-2">
              <MemberInfo member={member()} />

              <Map
                center={member().address.position}
                class="h-[400px] flex-1 rounded-lg shadow"
                markers={[{ position: member().address.position, payload: null }]}
              />
            </div>
          </div>
        )}
      </Show>
    </>
  );
};

type MemberInfoProps = {
  member: Member;
};

const MemberInfo: Component<MemberInfoProps> = (props) => {
  return (
    <div class="col gap-4">
      <MemberProfileData label={<T id="phoneNumber" />} icon={phone}>
        <ul>
          <For each={props.member.phoneNumbers}>
            {(phoneNumber) => (
              <li>
                <a href={`tel:${phoneNumber}`}>{formatPhoneNumber(phoneNumber)}</a>
              </li>
            )}
          </For>
        </ul>
      </MemberProfileData>

      <MemberProfileData label={<T id="emailAddress" />} icon={envelope}>
        <a href={`mailto:${props.member.email}`}>{props.member.email}</a>
      </MemberProfileData>

      <MemberProfileData label={<T id="mailingAddress" />} icon={home}>
        <MemberAddress address={props.member.address} />
      </MemberProfileData>

      <MemberProfileData label={<T id="bio" />} icon={user}>
        <p>{props.member.bio}</p>
      </MemberProfileData>
    </div>
  );
};

const formatPhoneNumber = (phoneNumber: string) => {
  assert(phoneNumber.length === 10);

  return Array(5)
    .fill(null)
    .map((_, i) => phoneNumber[2 * i] + phoneNumber[2 * i + 1])
    .join(' ');
};

type MemberProfileDataProps = ParentProps<{
  icon: ComponentProps<typeof Icon>['path'];
  label: JSX.Element;
}>;

const MemberProfileData: Component<MemberProfileDataProps> = (props) => {
  return (
    <div>
      <div class="mb-2">
        <Icon path={props.icon} class="inline-block h-em" />
        <span class="ml-2 align-middle font-semibold">{props.label}</span>
      </div>

      {props.children}
    </div>
  );
};
