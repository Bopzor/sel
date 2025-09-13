import { Icon } from 'solid-heroicons';
import { envelope, phone } from 'solid-heroicons/solid';
import { JSX } from 'solid-js';

import { ExternalLink } from 'src/components/link';
import { createTranslate } from 'src/intl/translate';

import { ContactEmail, ContactPhone } from './components/contact';
import { h2, h3 } from './components/headings';

const T = createTranslate('pages.landing.infos');

export function Infos() {
  return (
    <section id="infos" class="mt-24 scroll-m-32">
      <h2 class={h2()}>
        <T id="title" />
      </h2>

      <div class="grid max-w-4xl gap-x-24 gap-y-8 sm:grid-cols-2">
        <div>
          <h3 class={h3()}>
            <T id="contact.title" />
          </h3>

          <p class="my-4">
            <T id="contact.sentence" />
          </p>

          <ul>
            <li>
              <ContactPhone
                icon={<Icon path={phone} class="size-em text-dim" />}
                class="row items-center gap-2"
              />
            </li>
            <li>
              <ContactEmail
                icon={<Icon path={envelope} class="size-em text-dim" />}
                class="row items-center gap-2"
              />
            </li>
          </ul>
        </div>

        <div>
          <h3 class={h3()}>
            <T id="documents.title" />
          </h3>

          <ul class={'list-inside list-["👉_"]'}>
            <DocumentListItem
              // cspell:disable-next-line
              href="/storage/public/charte-selidaire.pdf"
              label={<T id="documents.charter" />}
            />

            <DocumentListItem
              // cspell:disable-next-line
              href="/storage/public/reglement-interieur.pdf"
              label={<T id="documents.rules" />}
            />

            <DocumentListItem href="/storage/public/statuts.pdf" label={<T id="documents.statutes" />} />
          </ul>
        </div>
      </div>
    </section>
  );
}

function DocumentListItem(props: { href: string; label: JSX.Element }) {
  return (
    <li>
      <ExternalLink href={props.href} target="_blank">
        {props.label}
      </ExternalLink>
    </li>
  );
}
