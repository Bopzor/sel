import { Component } from 'solid-js';

import logo from './logo.png';

export const Header: Component = () => {
  return (
    <header class="row items-center gap-4 bg-primary">
      <img src={logo} alt="SEL'ons-nous logo" width={64} height={64} />
      <span class="text-lg font-semibold text-white md:text-xl">Système d'échange local</span>
    </header>
  );
};
