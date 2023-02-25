import { ArrowLeftIcon } from '@heroicons/react/24/solid';

type BackLinkProps = {
  href: string;
};

export const BackLink = ({ href }: BackLinkProps) => (
  <a href={href} className="row items-center gap-1">
    <ArrowLeftIcon className="h-1 w-1" /> Retour
  </a>
);
