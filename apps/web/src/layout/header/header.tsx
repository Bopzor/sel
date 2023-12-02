import { Component, JSX } from 'solid-js';

import { Link } from '../../components/link';
import { MemberAvatar } from '../../components/member-avatar';
import { Row } from '../../components/row';
import { Translate } from '../../intl/translate';
import { routes } from '../../routes';
import { getAuthenticatedMember } from '../../utils/authenticated-member';

import Logo from './logo.svg';

const T = Translate.prefix('layout.header');

type HeaderProps = {
  children?: JSX.Element;
};

export const Header: Component<HeaderProps> = (props) => {
  return (
    <header class="bg-primary text-white">
      <Row class="mx-auto max-w-7xl justify-between p-2 md:p-4">
        <Link unstyled href={routes.home} class="inline-flex flex-row items-center gap-2 md:gap-4">
          <Logo width={64} height={64} class="rounded" />
          <div>
            <div class="text-lg font-semibold md:text-2xl">
              <T id="title" />
            </div>
            <div class="text-sm text-white/80">
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
  const member = getAuthenticatedMember();

  return (
    <Link unstyled href={routes.profile.profileEdition} class="col items-center gap-1 font-semibold">
      <MemberAvatar member={member()} class="h-10 w-10 rounded-full" />
      <div class="leading-1">{member().firstName}</div>
    </Link>
  );
};
