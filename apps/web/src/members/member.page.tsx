import { Member } from '@sel/shared';
import { defined } from '@sel/utils';
import { useParams } from '@solidjs/router';
import { Icon } from 'solid-heroicons';
import { envelope, home, phone, user } from 'solid-heroicons/solid';
import { Component, ComponentProps, For, JSX, ParentProps, Show } from 'solid-js';

import { Async } from '../components/async';
import { BackLink } from '../components/back-link';
import { Map } from '../components/map';
import { MemberAddress } from '../components/member-address';
import { MemberAvatarName } from '../components/member-avatar-name';
import { Row } from '../components/row';
import { body } from '../fetcher';
import { Translate } from '../intl/translate';
import { routes } from '../routes';
import { formatPhoneNumber } from '../utils/format-phone-number';
import { query } from '../utils/query';

const T = Translate.prefix('members');

export const MemberPage: Component = () => {
  const { memberId } = useParams<{ memberId: string }>();

  const memberQuery = query((fetcher) => ({
    key: ['member', memberId],
    query: () => body(fetcher.get<Member>(`/api/members/${memberId}`)),
  }));

  return (
    <>
      <BackLink href={routes.members.list} />

      <Async query={memberQuery}>
        {(member) => (
          <div class="card gap-4 p-4 md:p-8">
            <Row class="gap-6">
              <MemberAvatarName
                member={member}
                classes={{ avatar: '!h-16 !w-16', name: 'text-xl font-semibold' }}
              />
            </Row>

            <hr class="my-4 md:my-6" />

            <div class="grid grid-cols-1 gap-8 md:grid-cols-2">
              <MemberInfo member={member} />
              <MemberMap member={member} />
            </div>
          </div>
        )}
      </Async>
    </>
  );
};

type MemberInfoProps = {
  member: Member;
};

const MemberInfo: Component<MemberInfoProps> = (props) => {
  return (
    <div class="col gap-4">
      <MemberProfileData
        when={props.member.phoneNumbers.length > 0}
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
      </MemberProfileData>

      <MemberProfileData when={props.member.email} label={<T id="emailAddress" />} icon={envelope}>
        <a class="unstyled" href={`mailto:${props.member.email}`}>
          {props.member.email}
        </a>
      </MemberProfileData>

      <MemberProfileData when={props.member.address} label={<T id="mailingAddress" />} icon={home}>
        <MemberAddress address={defined(props.member.address)} />
      </MemberProfileData>

      <MemberProfileData when={props.member.bio} label={<T id="bio" />} icon={user}>
        <p>{props.member.bio}</p>
      </MemberProfileData>
    </div>
  );
};

type MemberProfileDataProps = ParentProps<{
  when?: unknown;
  icon: ComponentProps<typeof Icon>['path'];
  label: JSX.Element;
}>;

const MemberProfileData: Component<MemberProfileDataProps> = (props) => {
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
};

type MemberMapProps = {
  member: Member;
};

const MemberMap: Component<MemberMapProps> = (props) => {
  return (
    <Show when={props.member.address?.position}>
      {(position) => (
        <Map
          center={position()}
          zoom={13}
          class="h-[24rem] flex-1"
          markers={[{ position: position(), isPopupOpen: false }]}
        />
      )}
    </Show>
  );
};
