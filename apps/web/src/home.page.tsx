import clsx from 'clsx';
import { Component, Index, JSX } from 'solid-js';

import { Link } from './components/link';
import { Translate } from './intl/translate';
import { routes } from './routes';

const T = Translate.prefix('home');

export const HomePage = () => {
  return (
    <div>
      <div class="grid grid-cols-1 gap-8 py-8 sm:grid-cols-2 md:grid-cols-3">
        <LinkCard
          href={routes.members.list}
          label={<T id="members.label" />}
          description={<T id="members.description" />}
          class="border-blue-400 from-blue-400/5 to-blue-400/20"
        />

        <LinkCard
          href={routes.requests.list}
          label={<T id="requests.label" />}
          description={<T id="requests.description" />}
          class="border-yellow-400 from-yellow-400/10 to-yellow-400/20"
        />

        <LinkCard
          href={routes.events.list}
          label={<T id="events.label" />}
          description={<T id="events.description" />}
          // eslint-disable-next-line tailwindcss/no-arbitrary-value
          class="border-[#9955DD] from-[#9955DD]/10 to-[#9955DD]/20"
        />

        <LinkCard
          href={routes.activities.home}
          label={<T id="activities.label" />}
          description={<T id="activities.description" />}
          class="border-red-400 from-red-400/10 to-red-400/20"
        />

        <LinkCard
          href={routes.assets.home}
          label={<T id="assets.label" />}
          description={<T id="assets.description" />}
          class="border-green-400 from-green-400/10 to-green-400/20"
        />

        <LinkCard
          href={routes.misc}
          label={<T id="misc.label" />}
          description={<T id="misc.description" />}
          class="border-gray-400 from-gray-400/10 to-gray-400/20"
        />
      </div>

      <News />
    </div>
  );
};

type LinkCardProps = {
  href: string;
  label: JSX.Element;
  description: JSX.Element;
  class: string;
};

const LinkCard: Component<LinkCardProps> = (props) => {
  return (
    <Link
      unstyled
      href={props.href}
      class={clsx('rounded-lg border  bg-gradient-to-tl p-8 transition-shadow hover:shadow-lg', props.class)}
    >
      <div class="text-xl font-semibold">{props.label}</div>
      <div class="mt-1">{props.description}</div>
    </Link>
  );
};

function News() {
  return (
    <>
      <h2 class="typo-h2">
        <T id="news.title" />
      </h2>

      <p>
        <T id="news.placeholder" />
      </p>

      <div class="col mt-6 gap-6">
        <Index each={Array(3).fill(null)}>
          {/* eslint-disable-next-line tailwindcss/no-arbitrary-value */}
          {() => <div class="min-h-[12rem] w-full rounded-lg bg-dim/5" />}
        </Index>
      </div>
    </>
  );
}
