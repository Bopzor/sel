import { Link } from '../components/link';

export const HomePage = () => {
  return (
    <div class="pt-8">
      <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
        <Link
          unstyled
          href="#"
          class="rounded-lg border border-requests bg-gradient-to-tl from-requests/5 to-requests/20 p-8 transition-shadow hover:shadow-lg"
        >
          <div class="text-xl font-semibold">Demandes</div>
          <div>Voir la liste des demandes en cours</div>
        </Link>

        <Link
          unstyled
          href="#"
          class="rounded-lg border border-events bg-gradient-to-tl from-events/5 to-events/20 p-8 transition-shadow hover:shadow-lg"
        >
          <div class="text-xl font-semibold">Événements</div>
          <div>Les ateliers, sorties, conseils d'animation...</div>
        </Link>

        <Link
          unstyled
          href="/membres"
          class="rounded-lg border border-members bg-gradient-to-tl from-members/5 to-members/20 p-8 transition-shadow hover:shadow-lg"
        >
          <div class="text-xl font-semibold">Membres</div>
          <div>Retrouver les membres de votre SEL</div>
        </Link>

        <Link
          unstyled
          href="#"
          class="rounded-lg border border-tools bg-gradient-to-tl from-tools/5 to-tools/20 p-8 transition-shadow hover:shadow-lg"
        >
          <div class="text-xl font-semibold">Matériel</div>
          <div>Dons d'objets et prêts de matériel</div>
        </Link>
      </div>
    </div>
  );
};
