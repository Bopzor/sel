import { useIntl } from '@cookbook/solid-intl';
import clsx from 'clsx';
import { Component, Index, JSX } from 'solid-js';

import { BackLink } from '../components/back-link';
import { Link } from '../components/link';
import { Translate } from '../intl/translate';
import { routes } from '../routes';

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

      <div class="col gap-6 md:flex-row-reverse">
        <Changelog />
        <News />
      </div>
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
    <div class="flex-2">
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
    </div>
  );
}

function Changelog() {
  return (
    <div class="flex-1">
      <h2 class="mb-2">
        <T id="changelog.title" />
      </h2>

      <ul class="col gap-2">
        <Index each={changelog}>{(entry) => <ChangelogEntry {...entry()} />}</Index>
      </ul>
    </div>
  );
}

const changelog: Array<ChangelogEntryProps> = [
  {
    date: '2023-12-09',
    title: "Structure de l'app",
    description:
      'Ajout de pages pour les sections à venir de l\'app, mise en place de cette section "nouveautés".',
  },
  {
    date: '2023-12-02',
    title: 'Progressive web app',
    description: "Mise en place de la version application mobile (installable) de l'app.",
  },
  {
    date: '2023-11-25',
    title: 'Édition du profil',
    description: "Ajout de la page d'édition des informations de profil.",
  },
  {
    date: '2023-11-13',
    title: 'Onboarding',
    description: "Ajout du funnel d'onboarding lors de la première connexion.",
  },
  {
    date: '2023-11-02',
    title: 'Authentification',
    description: 'Ajout du formulaire de connexion par email.',
  },
  {
    date: '2023-10-22',
    title: 'Carte interactive',
    description: 'Ajout de la care sur la page de la liste des membres.',
  },
  {
    date: '2023-10-05',
    title: 'Liste des membres',
    description: 'Ajout de la page listant les membres et de la fonction de recherche',
  },
  {
    date: '2023-09-04',
    title: 'Initialisation du projet',
    description: 'Création de la partie server (backend) et client (frontend).',
  },
];

type ChangelogEntryProps = {
  date: string;
  title: JSX.Element;
  description: JSX.Element;
};

function ChangelogEntry(props: ChangelogEntryProps) {
  const intl = useIntl();

  return (
    <li class="my-2">
      <div class="row items-center justify-between">
        <strong>{props.title}</strong>
        <span class="text-xs text-dim">{intl.formatDate(props.date)}</span>
      </div>
      <p class="m-0 text-sm">{props.description}</p>
    </li>
  );
}

export function RequestsPage() {
  return (
    <div>
      <BackLink href={routes.home} />

      <h1>
        <Translate id="requests.title" />
      </h1>

      <p class="font-semibold">
        <Translate id="requests.sentence1" />
      </p>

      <p>
        <Translate id="requests.sentence2" />
      </p>
    </div>
  );
}

export function EventsPage() {
  return (
    <div>
      <BackLink href={routes.home} />

      <h1>
        <Translate id="events.title" />
      </h1>

      <p class="font-semibold">
        <Translate id="events.sentence1" />
      </p>

      <p>
        <Translate id="events.sentence2" />
      </p>
    </div>
  );
}

export function ActivitiesPage() {
  return (
    <div>
      <BackLink href={routes.home} />

      <h1>
        <Translate id="activities.title" />
      </h1>

      <p class="font-semibold">
        <Translate id="activities.sentence1" />
      </p>

      <p>
        <Translate id="activities.sentence2" />
      </p>
    </div>
  );
}

export function AssetsPage() {
  return (
    <div>
      <BackLink href={routes.home} />

      <h1>
        <Translate id="assets.title" />
      </h1>

      <p class="font-semibold">
        <Translate id="assets.sentence1" />
      </p>

      <p>
        <Translate id="assets.sentence2" />
      </p>
    </div>
  );
}

export function MiscPage() {
  return (
    <div>
      <BackLink href={routes.home} />

      <h1>Divers</h1>

      <ul class="my-6 list-inside list-disc">
        <li>
          <a href="https://selonnous.notion.site/Le-projet-ab16bb70e9774a94a19c80a9b20089ce?pvs=4">
            Contexte
          </a>
        </li>

        <li>
          <a href="https://selonnous.notion.site/Slack-ac8f592a7d514fd987a882d957a60704?pvs=4">Slack</a>
        </li>

        <li>
          <a href="https://selonnous.notion.site/P-rim-tre-initial-0297522aefe744a18ff99218fe03240b?pvs=4">
            Périmètre initial du projet
          </a>
        </li>

        <li>
          <a href="https://selonnous.notion.site/Jalons-441e6d71bff242bbb3b65e57d1d8b134?pvs=4">Jalons</a>
        </li>

        <li>
          <a href="https://trello.com/b/5acsJhvj/sel-id%C3%A9es">Idées</a>
        </li>
      </ul>
    </div>
  );
}
