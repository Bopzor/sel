import { formatRelativeTime, formatDate } from '@formatjs/intl';
import { Member } from '@sel/shared';
import { defined, formatDateRelative } from '@sel/utils';
import { useParams } from '@solidjs/router';
import { Icon } from 'solid-heroicons';
import { envelope, home, phone, user, clock } from 'solid-heroicons/solid';
import {
  Component,
  ComponentProps,
  ErrorBoundary,
  For,
  JSX,
  ParentProps,
  Show,
  createEffect,
  onCleanup,
} from 'solid-js';
import { unwrap } from 'solid-js/store';

import { BackLink } from '../components/back-link';
import { SuspenseLoader } from '../components/loader';
import { Map } from '../components/map';
import { MemberAddress } from '../components/member-address';
import { MemberAvatarName } from '../components/member-avatar-name';
import { Row } from '../components/row';
import { FetchError } from '../fetcher';
import { Translate } from '../intl/translate';
import { routes } from '../routes';
import { getAppState, getMutations } from '../store/app-store';
import { formatPhoneNumber } from '../utils/format-phone-number';
const T = Translate.prefix('members');

export const MemberPage: Component = () => {
  return (
    <>
      <BackLink href={routes.members.list} />

      <ErrorBoundary
        fallback={(error) => {
          if (FetchError.is(error, 404)) {
            return <MemberNotFound message={error.message} />;
          }

          throw error;
        }}
      >
        <SuspenseLoader>
          <PageContent />
        </SuspenseLoader>
      </ErrorBoundary>
    </>
  );
};

function MemberNotFound(props: { message: string }) {
  return (
    <div class="col my-6 items-center">
      <h1>
        <T id="notFound.title" />
      </h1>
      <p>
        <T id="notFound.description" />
      </p>
      <p class="text-xs text-dim">{props.message}</p>
    </div>
  );
}

function PageContent() {
  const { memberId } = useParams<{ memberId: string }>();

  const state = getAppState();
  const { loadMember } = getMutations();

  createEffect(() => loadMember(memberId));
  onCleanup(() => loadMember(undefined));

  return (
    <div class="card gap-4 p-4 md:p-8">
      <Row class="gap-6">
        <MemberAvatarName
          member={state.member}
          classes={{ avatar: '!h-16 !w-16', name: 'text-xl font-semibold' }}
        />
      </Row>

      <hr class="my-4 md:my-6" />

      <div class="grid grid-cols-1 gap-8 md:grid-cols-2">
        <MemberInfo member={state.member} />
        <MemberMap member={state.member} />
      </div>
    </div>
  );
}

type MemberInfoProps = {
  member?: Member;
};

const MemberInfo: Component<MemberInfoProps> = (props) => {
  return (
    <div class="col gap-4">
      <MemberProfileData
        when={props.member && props.member.phoneNumbers.length > 0}
        label={<T id="phoneNumber" />}
        icon={phone}
      >
        <ul>
          <For each={props.member?.phoneNumbers}>
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

      <MemberProfileData when={props.member?.email} label={<T id="emailAddress" />} icon={envelope}>
        <a class="unstyled" href={`mailto:${props.member?.email}`}>
          {props.member?.email}
        </a>
      </MemberProfileData>

      <MemberProfileData when={props.member?.address} label={<T id="mailingAddress" />} icon={home}>
        <MemberAddress address={defined(props.member?.address)} />
      </MemberProfileData>

      <MemberProfileData
        when={props.member?.membershipStartDate}
        label={<T id="membershipDate" />}
        icon={clock}
      >
        <p>
          <T
            id="membershipDateFormatted"
            values={{
              date: new Date(props.member?.membershipStartDate ?? ''),
              relative: formatDateRelative(props.member?.membershipStartDate ?? ''),
              dim: (children) => <span class="text-sm text-dim">{children}</span>,
            }}
          />
        </p>
      </MemberProfileData>

      <MemberProfileData when={props.member?.bio} label={<T id="bio" />} icon={user}>
        <p>{props.member?.bio}</p>
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
  member?: Member;
};

const MemberMap: Component<MemberMapProps> = (props) => {
  return (
    <Show when={props.member?.address?.position}>
      {(position) => (
        <Map
          center={position()}
          zoom={13}
          class="!h-[24rem] flex-1"
          markers={[{ position: position(), isPopupOpen: false }]}
        />
      )}
    </Show>
  );
};
