import { Component, JSX, Show, Suspense } from 'solid-js';

import { Link } from '../../components/link';
import { MemberAvatar } from '../../components/member-avatar';
import { Row } from '../../components/row';
import { Translate } from '../../intl/translate';
import { routes } from '../../routes';
import { getAppState } from '../../store/app-store';

import Logo from './logo.svg';

const T = Translate.prefix('layout.header');

type HeaderProps = {
  children?: JSX.Element;
};

export const Header: Component<HeaderProps> = (props) => {
  return (
    <header class="bg-primary text-[#fff]">
      <Row class="mx-auto max-w-7xl justify-between p-2 md:p-4">
        <Link unstyled href={routes.home} class="inline-flex flex-row items-center gap-2 md:gap-4">
          <Logo width={64} height={64} class="rounded" />
          <div>
            <div class="text-lg font-semibold md:text-2xl">
              <T id="title" />
            </div>
            <div class="text-sm text-[#fff]/80">
              <T id="subtitle" />
            </div>
          </div>
        </Link>

        {props.children}
      </Row>
    </header>
  );
};

export const HeaderMember = () => {
  const state = getAppState();
  const count = () => state.unreadNotificationsCount ?? 0;

  return (
    <Suspense>
      <Link
        unstyled
        href={routes.profile.profileEdition}
        class="col relative items-center gap-1 font-semibold"
      >
        <MemberAvatar member={state.authenticatedMember} class="relative size-10 rounded-full" />

        <span
          class="row absolute -right-1 -top-1 size-5 scale-0 items-center justify-center rounded-full bg-green-600 text-sm transition-transform"
          classList={{ 'scale-100': count() > 0 }}
        >
          <Show when={count() < 10} fallback={<T id="notificationsCountGreaterThan9" />}>
            {count()}
          </Show>
        </span>

        <div class="leading-1">{state.authenticatedMember?.firstName}</div>
      </Link>
    </Suspense>
  );
};
