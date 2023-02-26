import clsx from 'clsx';

import { Translation } from '../../app/i18n.context';

const T = Translation.create('home');

export const MainNavigation = () => (
  <nav className="my-2 grid grid-cols-1 gap-2 md:grid-cols-2">
    <Section
      href="/demandes"
      className="bg-requests"
      title={<T>Requests</T>}
      description={<T>View the list of pending requests</T>}
    />

    <Section href="/" className="bg-events" title={<T>Events</T>} description={<T>Workshops, ...</T>} />

    <Section href="/" className="bg-members" title={<T>Members</T>} description={<T>Your LTS's members</T>} />

    <Section href="/" className="bg-tools" title={<T>Tools</T>} description={<T>Giving a lending tools</T>} />
  </nav>
);

type SectionProps = {
  href: string;
  className: string;
  title: React.ReactNode;
  description: React.ReactNode;
};

export const Section = ({ href, className, title, description }: SectionProps) => (
  <a href={href} className={clsx('rounded-lg px-1 py-3 text-center shadow-md hover:opacity-90', className)}>
    <div className="typo-title">{title}</div>
    <div className="font-medium text-muted">{description}</div>
  </a>
);
