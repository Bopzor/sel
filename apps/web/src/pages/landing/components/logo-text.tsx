import { A } from '@solidjs/router';

import { createTranslate } from 'src/intl/translate';
import Logo from 'src/logo.svg';

const T = createTranslate('pages.landing.logoText');

export function LogoText() {
  return (
    <A href="#" class="row items-center gap-4">
      <Logo class="size-18 rounded-lg" />

      <div class="leading-none">
        <div class="text-lg font-semibold xl:text-2xl">
          <T id="line1" />
        </div>

        <div>
          <T id="line2" />
        </div>
      </div>
    </A>
  );
}
