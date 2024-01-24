import { useIntl } from '@cookbook/solid-intl';
import { Index, JSX } from 'solid-js';

import { BackLink } from './components/back-link';
import { Translate } from './intl/translate';
import { routes } from './routes';

const T = Translate.prefix('home');

export function MiscPage() {
  return (
    <div>
      <BackLink href={routes.home} />

      <div class="col sm:row gap-6">
        <div class="col flex-1 gap-6">
          <section>
            <h2 class="mb-2">Contact</h2>

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
          </section>

          <section>
            <h2 class="mb-2">Contexte</h2>

            <p>
              Le développement de l'app est à l'initiative de Nils et Violaine, membres de SEL'ons-nous depuis
              2022. Nous sommes tous les deux développeurs d'applications web, et travaillons sur ce projet
              sur notre temps libre, pour le plaisir et parce que c'est une opportunité pour nous de mettre à
              profit nos compétences via un projet concret.
            </p>

            <p>
              Plus d'informations par rapport au contexte du projet et notre manière de fonctionner sont
              disponible{' '}
              <a href="https://selonnous.notion.site/Le-projet-ab16bb70e9774a94a19c80a9b20089ce?pvs=4">
                sur cette page
              </a>
              .
            </p>
          </section>

          <section>
            <h2 class="mb-2">Liens</h2>

            <ul class="list-inside list-disc">
              <li>
                <a href="https://selonnous.notion.site/P-rim-tre-initial-0297522aefe744a18ff99218fe03240b?pvs=4">
                  Périmètre initial
                </a>{' '}
                : la liste des fonctionnalités qui seront réalisées avant septembre 2024.
              </li>

              <li>
                <a href="https://selonnous.notion.site/Jalons-441e6d71bff242bbb3b65e57d1d8b134?pvs=4">
                  Jalons
                </a>{' '}
                : les dates estimées pour la réalisation des différentes fonctionnalités.
              </li>

              <li>
                <a href="https://trello.com/b/5acsJhvj/sel-id%C3%A9es">Roadmap</a> : idées et choses à faire.
              </li>
            </ul>
          </section>
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
    <section>
      <h2 class="mb-2">
        <T id="changelog.title" />
      </h2>

      <ul class="divide-y">
        <Index each={changelog}>{(entry) => <ChangelogEntry {...entry()} />}</Index>
      </ul>
    </section>
  );
}

const changelog: Array<ChangelogEntryProps> = [
  {
    date: '2023-12-26',
    description: 'Première version des demandes.',
  },
  {
    date: '2023-12-18',
    description: 'Ajout du mode sombre.',
  },
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
    <li class="row py-2">
      <p class="mt-1 w-24 text-xs text-dim">{intl.formatDate(props.date)}</p>
      <p class="flex-1">{props.description}</p>
    </li>
  );
}
