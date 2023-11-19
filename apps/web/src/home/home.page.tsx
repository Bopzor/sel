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
          href="/membres"
          label={<T id="members.label" />}
          description={<T id="members.description" />}
          class="border-blue-400 from-blue-400/5 to-blue-400/20"
        />

        <LinkCard
          href="#"
          label="Brique 2"
          description="..."
          class="border-yellow-400 from-yellow-400/10 to-yellow-400/20"
        />

        <LinkCard
          href="#"
          label="Brique 3"
          description="..."
          // eslint-disable-next-line tailwindcss/no-arbitrary-value
          class="border-[#9955DD] from-[#9955DD]/10 to-[#9955DD]/20"
        />

        <LinkCard
          href="#"
          label="Brique 4"
          description="..."
          class="border-red-400 from-red-400/10 to-red-400/20"
        />

        <LinkCard
          href="#"
          label="Brique 5"
          description="..."
          class="border-gray-400 from-gray-400/10 to-gray-400/20"
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
