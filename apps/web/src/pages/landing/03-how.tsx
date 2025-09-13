import { createTranslate } from 'src/intl/translate';

import { h2 } from './components/headings';
import screenshot from './screenshot.png';

const T = createTranslate('pages.landing.how');

export function How() {
  const t = T.useTranslate();

  return (
    <section id="how" class="mt-24 scroll-m-32 lg:mx-32">
      <h2 class={h2()}>
        <T id="title" />
      </h2>

      <div class="col items-center gap-16 sm:row">
        <div class="col flex-1 gap-10 sm:order-2">
          <p>
            <T id="paragraph1" />
          </p>

          <p>
            <T id="paragraph2" />
          </p>

          <p>
            <T id="paragraph3" />
          </p>
        </div>

        <img alt={t('image')} src={screenshot} class="max-w-64 drop-shadow-xl/30" />
      </div>
    </section>
  );
}
