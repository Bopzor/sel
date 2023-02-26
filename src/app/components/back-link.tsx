import { ArrowLeftIcon } from '@heroicons/react/24/solid';

import { Translation } from '../i18n.context';

type BackLinkProps = {
  href: string;
};

export const BackLink = ({ href }: BackLinkProps) => (
  <a href={href} className="row items-center gap-1 font-medium">
    <ArrowLeftIcon className="h-1 w-1" /> <Translation ns="common">Back</Translation>
  </a>
);
