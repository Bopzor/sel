import { A } from '@solidjs/router';
import { createEffect, createSignal, JSX } from 'solid-js';

import { LinkButton } from 'src/components/button';
import { createTranslate } from 'src/intl/translate';

import { LogoText } from './logo-text';

const T = createTranslate('pages.landing.header');

export function Header() {
  const [scroll, setScroll] = createSignal(window.scrollY);

  createEffect(() => {
    window.addEventListener('scroll', () => setScroll(window.scrollY));
  });

  return (
    <header
      data-scroll={scroll()}
      class="sticky top-0 z-10 mx-auto bg-body font-nunito shadow-md transition-shadow data-[scroll=0]:shadow-none"
    >
      <div class="mx-auto row max-w-6xl flex-wrap items-center gap-4 px-4 py-3">
        <LogoText />

        <nav class="ml-auto row items-center gap-8 text-lg">
          <NavLink href="#overview" label={<T id="overview" />} />
          <NavLink href="#how" label={<T id="how" />} />
          <NavLink href="#infos" label={<T id="infos" />} />

          <div role="separator" aria-orientation="vertical" class="self-stretch border-l-2 max-sm:hidden" />

          <LinkButton href="/authentication" class="border-primary bg-primary">
            <T id="signIn" />
          </LinkButton>
        </nav>
      </div>
    </header>
  );
}

function NavLink(props: { href: string; label: JSX.Element }) {
  return (
    <A href={props.href} class="hover:underline max-sm:hidden">
      {props.label}
    </A>
  );
}
