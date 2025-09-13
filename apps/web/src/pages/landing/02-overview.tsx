import { Icon } from 'solid-heroicons';
import { arrowPathRoundedSquare, sparkles, userGroup } from 'solid-heroicons/solid';
import { ComponentProps, JSX } from 'solid-js';

import { createTranslate } from 'src/intl/translate';

import { h2 } from './components/headings';

const T = createTranslate('pages.landing.overview');

export function Overview() {
  return (
    <section id="overview" class="scroll-m-32">
      <h2 class={h2()}>
        <T id="title" />
      </h2>

      <div class="col justify-center gap-4 max-sm:items-center sm:row sm:gap-12">
        <OverviewItem icon={arrowPathRoundedSquare} text={<T id="services" />} />
        <OverviewItem icon={userGroup} text={<T id="bonding" />} />
        <OverviewItem icon={sparkles} text={<T id="talents" />} />
      </div>

      <div class="my-16 col gap-16 sm:row">
        <p class="max-w-xl flex-1 text-justify">
          <T id="paragraph1" />
        </p>

        <p class="max-w-xl flex-1 text-justify">
          <T id="paragraph2" />
        </p>
      </div>
    </section>
  );
}

function OverviewItem(props: { icon: ComponentProps<typeof Icon>['path']; text: JSX.Element }) {
  return (
    <div class="row w-80 items-center gap-4 rounded-xl border bg-white px-4 py-6 shadow-lg sm:col">
      <div>
        <Icon path={props.icon} class="size-12 fill-primary sm:size-24" />
      </div>

      <div class="col flex-1 justify-center text-2xl font-medium sm:text-center">{props.text}</div>
    </div>
  );
}
