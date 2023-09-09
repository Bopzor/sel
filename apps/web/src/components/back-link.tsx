import { A } from '@solidjs/router';
import { Icon } from 'solid-heroicons';
import { arrowLeft } from 'solid-heroicons/solid';

type BackLinkProps = {
  href: string;
};

export const BackLink = (props: BackLinkProps) => (
  <A href={props.href} class="my-8 inline-block">
    <Icon path={arrowLeft} class="inline-block h-em" />
    <span class="ml-4 align-middle font-medium text-dim">Retour</span>
  </A>
);
