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

      <div class="row gap-6">
        <div class="flex-1">
          <h2>Contact</h2>

          <p>
            Nous communiquons régulièrement les informations importantes relative au développement du projet
            via un groupe sur Slack, une plateforme de discussion en ligne. Pour vous connecter,{' '}
            <a href="https://selonnous.notion.site/Slack-ac8f592a7d514fd987a882d957a60704?pvs=4">
              suivez le guide
            </a>
            .
          </p>

          <p>
            Pour remonter un problème ou proposer des idées, vous pouvez aussi{' '}
            <a href="https://selonnous.communityforge.net/users/152">nous envoyer un message</a>.
          </p>

          <h2>Contexte</h2>

          <p>
            Le développement de l'app est à l'initiative de Nils et Violaine, membres de SEL'ons-nous depuis
            2022. Nous sommes tous les deux développeurs d'applications web, et travaillons sur ce projet sur
            notre temps libre, pour le plaisir et parce que c'est une opportunité pour nous de mettre à profit
            nos compétences via un projet concret.
          </p>

          <p>
            Plus d'informations par rapport au contexte du projet et notre manière de fonctionner sont
            disponible{' '}
            <a href="https://selonnous.notion.site/Le-projet-ab16bb70e9774a94a19c80a9b20089ce?pvs=4">
              sur cette page
            </a>
            .
          </p>

          <h2>Liens</h2>

          <ul class="list-inside list-disc">
            <li>
              <a href="https://selonnous.notion.site/P-rim-tre-initial-0297522aefe744a18ff99218fe03240b?pvs=4">
                Périmètre initial
              </a>{' '}
              : la liste des fonctionnalités qui seront réalisées avant septembre 2024.
            </li>

            <li>
              <a href="https://selonnous.notion.site/Jalons-441e6d71bff242bbb3b65e57d1d8b134?pvs=4">Jalons</a>{' '}
              : les dates estimées pour la réalisation des différentes fonctionnalités.
            </li>

            <li>
              <a href="https://trello.com/b/5acsJhvj/sel-id%C3%A9es">Roadmap</a> : idées et choses à faire,
              plus ou moins en vrac.
            </li>
          </ul>
        </div>

        <div class="max-w-md flex-1">
          <Changelog />
        </div>
      </div>
    </div>
  );
}

function Changelog() {
  return (
    <>
      <h2 class="mb-2">
        <T id="changelog.title" />
      </h2>

      <ul class="divide-y">
        <Index each={changelog}>{(entry) => <ChangelogEntry {...entry()} />}</Index>
      </ul>
    </>
  );
}

const changelog: Array<ChangelogEntryProps> = [
  {
    date: '2023-12-09',
    description: "Ajout des pages pour les sections à venir de l'app.",
  },
  {
    date: '2023-12-02',
    description: "Mise en place de la version application mobile (installable) de l'app.",
  },
  {
    date: '2023-11-25',
    description: "Ajout des pages d'édition des informations de profil.",
  },
  {
    date: '2023-11-13',
    description: 'Vérification des informations de profil lors de la première connexion.',
  },
  {
    date: '2023-11-02',
    description: "Ajout d'un formulaire de connexion par email.",
  },
  {
    date: '2023-10-22',
    description: "Ajout d'une la carte interactive sur la page de la liste des membres.",
  },
  {
    date: '2023-10-05',
    description: "Ajout d'une page listant les membres et d'une fonction de recherche.",
  },
  {
    date: '2023-09-04',
    description: 'Démarrage du projet',
  },
];

type ChangelogEntryProps = {
  date: string;
  description: JSX.Element;
};

function ChangelogEntry(props: ChangelogEntryProps) {
  const intl = useIntl();

  return (
    <li class="py-2">
      <span class="text-dim">{intl.formatDate(props.date)}</span> &bullet; {props.description}
    </li>
  );
}
