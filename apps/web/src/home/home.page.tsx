import clsx from 'clsx';
import { Component, JSX } from 'solid-js';

import { Link } from '../components/link';
import { Translate } from '../intl/translate';

const T = Translate.prefix('home');

export const HomePage = () => {
  return (
    <div class="pt-8">
      <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
        <LinkCard
          href="#"
          label={<T id="requests.label" />}
          description={<T id="requests.description" />}
          class="border-requests from-requests/10 to-requests/20"
        />

        <LinkCard
          href="#"
          label={<T id="events.label" />}
          description={<T id="events.description" />}
          class="border-events from-events/10 to-events/20"
        />

        <LinkCard
          href="/membres"
          label={<T id="members.label" />}
          description={<T id="members.description" />}
          class="border-members from-members/10 to-members/20"
        />

        <LinkCard
          href="#"
          label={<T id="tools.label" />}
          description={<T id="tools.description" />}
          class="border-tools from-tools/10 to-tools/20"
        />
      </div>
    </div>
  );
};

type LinkCardProps = {
  href: string;
  label: JSX.Element;
  description: JSX.Element;
  class: string;
};

const LinkCard: Component<LinkCardProps> = (props) => {
  return (
    <Link
      unstyled
      href={props.href}
      class={clsx('rounded-lg border  bg-gradient-to-tl p-8 transition-shadow hover:shadow-lg', props.class)}
    >
      <div class="text-xl font-semibold">{props.label}</div>
      <div>{props.description}</div>
    </Link>
  );
};
