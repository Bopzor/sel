import { Component } from 'solid-js';

import { Link } from '../../components/link';
import { Translate } from '../../intl/translate';

import logo from './logo.png';

const T = Translate.prefix('layout.header');

export const Header: Component = () => {
  return (
    <header class="border-b-2 border-b-[#004359] bg-primary">
      <div class="mx-auto max-w-[1300px] p-4 leading-0">
        <Link unstyled href="/" class="inline-flex flex-row items-center">
          <img src={logo} alt="SEL'ons-nous logo" width={64} height={64} class="mr-6 rounded" />
          <div>
            <div class="text-lg font-semibold text-white md:text-2xl">
              <T id="title" />
            </div>
            <div class="text-sm text-white/80">
              <T id="subtitle" />
            </div>
          </div>
        </Link>
      </div>
    </header>
  );
};
