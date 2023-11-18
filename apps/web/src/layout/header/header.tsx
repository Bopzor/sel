import { Component, Show } from 'solid-js';

import { selectAuthenticatedMemberUnsafe } from '../../authentication/authentication.slice';
import { Link } from '../../components/link';
import { MemberAvatar } from '../../components/member-avatar';
import { Translate } from '../../intl/translate';
import { selector } from '../../store/selector';

import logo from './logo.png';

const T = Translate.prefix('layout.header');

export const Header: Component = () => {
  const member = selector(selectAuthenticatedMemberUnsafe);

  return (
    <header class="border-b-2 border-b-[#004359] bg-primary text-white">
      <div class="row mx-auto max-w-[1300px] items-center justify-between p-2 md:p-4">
        <Link unstyled href="/" class="inline-flex flex-row items-center gap-2 md:gap-4">
          <img src={logo} alt="SEL'ons-nous logo" width={64} height={64} class="rounded" />
          <div>
            <div class="text-lg font-semibold md:text-2xl">
              <T id="title" />
            </div>
            <div class="text-sm text-white/80">
              <T id="subtitle" />
            </div>
          </div>
        </Link>

        <Show when={member()}>
          {(member) => (
            <Link unstyled href="/profil" class="col items-center gap-1 font-semibold">
              <MemberAvatar member={member()} class="h-10 w-10 rounded-full" />
              <div class="leading-1">{member().firstName}</div>
            </Link>
          )}
        </Show>
      </div>
    </header>
  );
};
