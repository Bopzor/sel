import { Icon } from 'solid-heroicons';
import { arrowLeft } from 'solid-heroicons/solid';

import { Translate } from '../intl/translate';

import { Link } from './link';

type BackLinkProps = {
  href: string;
};

export const BackLink = (props: BackLinkProps) => (
  <Link href={props.href} class="my-8 inline-flex flex-row items-center gap-2 self-start">
    <Icon path={arrowLeft} class="h-5" />
    <span class="font-medium text-dim">
      <Translate id="common.back" />
    </span>
  </Link>
);
