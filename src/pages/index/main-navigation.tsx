import clsx from 'clsx';

export const MainNavigation = () => (
  <nav className="grid grid-cols-2 gap-2">
    <Section
      href="/demandes"
      className="bg-requests"
      title="Demandes"
      description="Voir la liste des demandes en cours"
    />

    <Section
      href="/"
      className="bg-events"
      title="Événements"
      description="Les ateliers, sorties, conseils d'animation..."
    />

    <Section
      href="/"
      className="bg-members"
      title="Membres"
      description="Retrouver les membres de votre SEL"
    />

    <Section
      href="/"
      className="bg-tools"
      title="Matériel"
      description="Dons d'objets et prêts de matériel"
    />
  </nav>
);

type SectionProps = {
  href: string;
  className: string;
  title: string;
  description: string;
};

export const Section = ({ href, className, title, description }: SectionProps) => (
  <a href={href} className={clsx('rounded-lg px-1 py-3 text-center shadow-md hover:opacity-90', className)}>
    <div className="typo-title">{title}</div>
    <div className="font-medium text-muted">{description}</div>
  </a>
);
