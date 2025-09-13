import { getAppConfig } from 'src/application/config';
import { Button } from 'src/components/button';
import { ExternalLink } from 'src/components/link';
import { createTranslate } from 'src/intl/translate';

import { h1 } from './components/headings';

const T = createTranslate('pages.landing.hero');

export function Hero() {
  const { contactEmail } = getAppConfig();

  return (
    <section class="mx-auto my-12 col max-w-fit gap-6 sm:my-24">
      <h1 class={h1()}>
        <T id="heading" />
      </h1>

      <div class="text-4xl font-bold whitespace-pre-wrap text-primary sm:text-6xl">
        <T id="title" />
      </div>

      <div class="mx-auto my-8 text-2xl">
        <ExternalLink href={`mailto:${contactEmail}`} class={Button.class({ class: 'gap-4 px-8 py-3' })}>
          <T id="cta" />
        </ExternalLink>
      </div>
    </section>
  );
}
