import { useIntl } from '@cookbook/solid-intl';
import { Index, JSX } from 'solid-js';

import { Translate } from '../../intl/translate';

const T = Translate.prefix('home');

export function Changelog() {
  return (
    <section>
      <h2 class="mb-2">
        <T id="changelog.title" />
      </h2>

      <ul class="card divide-y overflow-y-auto p-2 sm:max-h-md">
        <Index each={changelog}>{(entry) => <ChangelogEntry {...entry()} />}</Index>
      </ul>
    </section>
  );
}

const changelog: Array<ChangelogEntryProps> = [
  {
    date: '2024-02-03',
    description: 'Ajout des statuts et des réponses aux demandes.',
  },
  {
    date: '2024-01-28',
    description: 'Ajout des notifications.',
  },
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
