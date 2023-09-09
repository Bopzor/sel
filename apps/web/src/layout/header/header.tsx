import { Component } from 'solid-js';

import logo from './logo.png';

export const Header: Component = () => {
  return (
    <header class="border-b-2 border-b-[#004359] bg-primary">
      <div class="mx-auto max-w-[1300px] p-4">
        <a href="/">
          <img src={logo} alt="SEL'ons-nous logo" width={64} height={64} class="mr-6 inline-block rounded" />
          <span class="align-middle text-lg font-semibold text-white md:text-2xl">
            Système d'échange local
          </span>
        </a>
      </div>
    </header>
  );
};
