import clsx from 'clsx';
import { Icon } from 'solid-heroicons';
import { exclamationTriangle } from 'solid-heroicons/solid';
import { Index, JSX } from 'solid-js';

import { Link } from '../../components/link';
import { Translate } from '../../intl/translate';
import { routes } from '../../routes';

const T = Translate.prefix('home');

export default function HomePage() {
  return (
    <div>
      <PreviewBanner />

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
}

function PreviewBanner() {
  return (
    <div class="mt-4 rounded border border-yellow-600 p-4">
      <h2 class="row items-center gap-2">
        <Icon path={exclamationTriangle} class="inline-block size-6 text-yellow-600" />
        Attention
      </h2>

      <p>
        Ce site est en cours de développement, les demandes, événements, et toutes autres informations sont
        des <strong>données de test</strong>. Vous pouvez bien sûr tester en créant des annonces et
        commentaires fictifs.
      </p>

      <p>
        Pour les annonces réelles du SEL, nous continuons à utiliser{' '}
        <a href="https://selonnous.communityforge.net">https://selonnous.communityforge.net</a>.
      </p>
    </div>
  );
}

type LinkCardProps = {
  href: string;
  label: JSX.Element;
  description: JSX.Element;
  class: string;
};

function LinkCard(props: LinkCardProps) {
  return (
    <Link
      unstyled
      href={props.href}
      class={clsx('rounded-lg border bg-gradient-to-tl p-8 transition-shadow hover:shadow-lg', props.class)}
    >
      <div class="text-xl font-semibold">{props.label}</div>
      <div class="mt-1">{props.description}</div>
    </Link>
  );
}

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
        <Index each={Array(3).fill(null)}>{() => <div class="min-h-48 w-full rounded-lg bg-dim/5" />}</Index>
      </div>
    </>
  );
}
