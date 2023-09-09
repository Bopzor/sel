import { Icon } from 'solid-heroicons';
import { arrowLeft } from 'solid-heroicons/solid';

import { Link } from './link';

type BackLinkProps = {
  href: string;
};

export const BackLink = (props: BackLinkProps) => (
  <Link href={props.href} class="my-8 inline-flex flex-row items-center gap-4">
    <Icon path={arrowLeft} class="h-em" />
    <span class="font-medium text-dim">Retour</span>
  </Link>
);
