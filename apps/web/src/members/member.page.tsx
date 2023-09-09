import { Member } from '@sel/shared';
import { useParams } from '@solidjs/router';
import { Icon } from 'solid-heroicons';
import { envelope, home, phone, user } from 'solid-heroicons/solid';
import { Component, ComponentProps, createEffect, JSX, ParentProps, Show } from 'solid-js';

import { BackLink } from '../components/back-link';
import { Map } from '../components/map';
import { MemberAddress } from '../components/member-address';
import { MemberAvatarName } from '../components/member-avatar-name';
import { selector } from '../store/selector';
import { store } from '../store/store';

import { selectMemberUnsafe } from './members.slice';
import { fetchMember } from './use-cases/fetch-member/fetch-member';

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

      <Show when={member()} fallback={<>Loading...</>}>
        {(member) => (
          <div class="card gap-4 p-8">
            <MemberAvatarName member={member()} />

            <hr class="my-6" />

            <div class="grid grid-cols-1 md:grid-cols-2">
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
      <MemberProfileData label="Numéro de téléphone" icon={phone}>
        <a href={`tel:${props.member.phoneNumber}`}>{props.member.phoneNumber}</a>
      </MemberProfileData>

      <MemberProfileData label="Adresse email" icon={envelope}>
        <a href={`mailto:${props.member.email}`}>{props.member.email}</a>
      </MemberProfileData>

      <MemberProfileData label="Adresse postale" icon={home}>
        <MemberAddress address={props.member.address} />
      </MemberProfileData>

      <MemberProfileData label="À propos de moi" icon={user}>
        <p>{props.member.bio}</p>
      </MemberProfileData>
    </div>
  );
};

type MemberProfileDataProps = ParentProps<{
  icon: ComponentProps<typeof Icon>['path'];
  label: string;
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
