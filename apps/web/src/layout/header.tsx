import { Component, JSX } from 'solid-js';

import { Link } from '../components/link';
import { Translate } from '../intl/translate';
import Logo from '../logo.svg';
import { routes } from '../routes';

const T = Translate.prefix('layout.header');

type HeaderProps = {
  children?: JSX.Element;
};

export const Header: Component<HeaderProps> = (props) => {
  return (
    <header class="bg-primary text-white">
      <div class="row mx-auto max-w-7xl items-center justify-between p-2 md:p-4">
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
      </div>
    </header>
  );
};
