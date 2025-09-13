import { A } from '@solidjs/router';
import { JSX } from 'solid-js';

import { ExternalLink } from 'src/components/link';
import { createTranslate } from 'src/intl/translate';

import { ContactEmail, ContactPhone } from './contact';
import { LogoText } from './logo-text';

// cspell:words bopzor devs

const T = createTranslate('pages.landing.footer');

export function Footer() {
  return (
    <footer class="mt-12 min-h-80 bg-primary font-nunito text-white">
      <div class="mx-auto grid max-w-6xl gap-x-4 gap-y-8 px-4 py-16 sm:grid-cols-auto-3">
        <Contact />
        <Navigation />
        <Infos />
      </div>
    </footer>
  );
}

function Contact() {
  return (
    <div>
      <LogoText />

      <ul class="mt-12 text-lg">
        <li>
          <ContactPhone />
        </li>
        <li>
          <ContactEmail />
        </li>
      </ul>
    </div>
  );
}

function Navigation() {
  return (
    <nav class="col items-start gap-1 text-lg">
      <div class="mb-1 text-xl font-semibold">
        <T id="navigation.title" />
      </div>

      <NavLink href="#" label={<T id="navigation.home" />} />
      <NavLink href="#overview" label={<T id="navigation.overview" />} />
      <NavLink href="#how" label={<T id="navigation.how" />} />
      <NavLink href="#infos" label={<T id="navigation.infos" />} />
    </nav>
  );
}

function NavLink(props: { href: string; label: JSX.Element }) {
  return (
    <A href={props.href} class="hover:underline">
      {props.label}
    </A>
  );
}

function Infos() {
  return (
    <div class="col gap-2">
      <div class="mb-1 text-xl font-semibold">
        <T id="technical.title" />
      </div>

      <p>
        <T id="technical.source" values={{ link: repository }} />
      </p>

      <p>
        <T id="technical.host" values={{ link: host }} />
      </p>

      <p>
        <T id="technical.devs" values={{ nilscox, bopzor }} />
      </p>
    </div>
  );
}

const repository = (children: JSX.Element) => (
  <ExternalLink href="https://github.com/bopzor/sel" class="underline">
    {children}
  </ExternalLink>
);

const host = (children: JSX.Element) => (
  <ExternalLink href="https://www.koyeb.com" class="underline">
    {children}
  </ExternalLink>
);

const nilscox = (children: JSX.Element) => (
  <ExternalLink href="https://github.com/nilscox" class="underline">
    {children}
  </ExternalLink>
);

const bopzor = (children: JSX.Element) => (
  <ExternalLink href="https://github.com/bopzor" class="underline">
    {children}
  </ExternalLink>
);
