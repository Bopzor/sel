import { BackLink } from '../../components/back-link';
import { routes } from '../../routes';

import { Changelog } from './changelog';

export default function MiscPage() {
  return (
    <div>
      <BackLink href={routes.home} />

      <div class="col sm:row gap-6">
        <div class="col flex-1 gap-6">
          <Contact />
          <Context />
          <Links />
        </div>

        <div class="flex-1 sm:max-w-md">
          <Changelog />
        </div>
      </div>
    </div>
  );
}

function Contact() {
  return (
    <section>
      <h2 class="mb-2">Contact</h2>

      <p>
        Nous communiquons régulièrement les informations importantes relative au développement du projet via
        un groupe sur Slack, une plateforme de discussion en ligne. Pour vous connecter,{' '}
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
  );
}

function Context() {
  return (
    <section>
      <h2 class="mb-2">Contexte</h2>

      <p>
        Le développement de l'app est à l'initiative de Nils et Violaine, membres de SEL'ons-nous depuis 2022.
        Nous sommes tous les deux développeurs d'applications web, et travaillons sur ce projet sur notre
        temps libre, pour le plaisir et parce que c'est une opportunité pour nous de mettre à profit nos
        compétences via un projet concret.
      </p>

      <p>
        Plus d'informations par rapport au contexte du projet et notre manière de fonctionner sont disponible{' '}
        <a href="https://selonnous.notion.site/Le-projet-ab16bb70e9774a94a19c80a9b20089ce?pvs=4">
          sur cette page
        </a>
        .
      </p>
    </section>
  );
}

function Links() {
  return (
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
          <a href="https://selonnous.notion.site/Jalons-441e6d71bff242bbb3b65e57d1d8b134?pvs=4">Jalons</a> :
          les dates estimées pour la réalisation des différentes fonctionnalités.
        </li>

        <li>
          <a href="https://trello.com/b/5acsJhvj/sel-id%C3%A9es">Roadmap</a> : idées et choses à faire.
        </li>
      </ul>
    </section>
  );
}
