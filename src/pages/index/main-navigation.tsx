import clsx from 'clsx';

import { useTranslate } from '../../app/i18n.context';

export const MainNavigation = () => {
  const t = useTranslate('home');

  return (
    <nav className="my-2 grid grid-cols-2 gap-2">
      <Section
        href="/demandes"
        className="bg-requests"
        title={t('Requests')}
        description={t('View the list of pending requests')}
      />

      <Section href="/" className="bg-events" title={t('Events')} description={t('Workshops, ...')} />
      <Section href="/" className="bg-members" title={t('Members')} description={t("Your LTS's members")} />
      <Section href="/" className="bg-tools" title={t('Tools')} description={t('Giving a lending tools')} />
    </nav>
  );
};

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
