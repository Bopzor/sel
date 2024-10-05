import clsx from 'clsx';
import { Icon } from 'solid-heroicons';
import {
  calendar,
  exclamationTriangle,
  handRaised,
  sparkles,
  star,
  users,
  wrench,
} from 'solid-heroicons/solid';
import { ComponentProps, Index, JSX } from 'solid-js';

import { Link } from '../../components/link';
import { Translate } from '../../intl/translate';
import { routes } from '../../routes';

const T = Translate.prefix('home');

export default function HomePage() {
  return (
    <div>
      <PreviewBanner />

      <div class="row gap-8 py-16">
        <div class="grid max-w-sm grid-cols-1 gap-6">
          <LinkCard
            href={routes.members.list}
            label={<T id="members.label" />}
            description={<T id="members.description" />}
            icon={users}
          />

          <LinkCard
            href={routes.requests.list}
            label={<T id="requests.label" />}
            description={<T id="requests.description" />}
            icon={handRaised}
          />

          <LinkCard
            href={routes.events.list}
            label={<T id="events.label" />}
            description={<T id="events.description" />}
            icon={calendar}
          />

          <LinkCard
            href={routes.interests}
            label={<T id="interests.label" />}
            description={<T id="interests.description" />}
            icon={sparkles}
          />

          <LinkCard
            href={routes.assets.home}
            label={<T id="assets.label" />}
            description={<T id="assets.description" />}
            icon={wrench}
          />

          <LinkCard
            href={routes.misc}
            label={<T id="misc.label" />}
            description={<T id="misc.description" />}
            icon={star}
          />
        </div>

        <div class="flex-1">
          <News />
        </div>
      </div>
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
  icon: ComponentProps<typeof Icon>['path'];
  class?: string;
};

function LinkCard(props: LinkCardProps) {
  return (
    <Link
      unstyled
      href={props.href}
      class={clsx(
        'row group items-center gap-4 rounded-lg border border-primary bg-gradient-to-tl from-gray-400/10 to-gray-400/20 px-6 py-4 transition-all hover:bg-primary/10 hover:shadow-lg',
        props.class,
      )}
    >
      <div>
        <Icon path={props.icon} class="size-8 text-gray-400 transition-colors group-hover:text-primary" />
      </div>
      <div>
        <div class="text-xl font-semibold">{props.label}</div>
        <div class="mt-1 text-dim group-hover:text-primary">{props.description}</div>
      </div>
    </Link>
  );
}

function News() {
  return (
    <>
      <h2 class="typo-h1">
        <T id="news.title" />
      </h2>

      <div class="col mt-6 gap-6">
        <Index each={Array(3).fill(null)}>{() => <div class="min-h-48 w-full rounded-lg bg-dim/5" />}</Index>
      </div>
    </>
  );
}
