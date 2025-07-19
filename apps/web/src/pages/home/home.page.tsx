import { useQuery } from '@tanstack/solid-query';
import clsx from 'clsx';
import { Icon } from 'solid-heroicons';
import { calendar, handRaised, sparkles, star, users } from 'solid-heroicons/solid';
import { ComponentProps, For, JSX, Show } from 'solid-js';

import { apiQuery } from 'src/application/query';
import { routes } from 'src/application/routes';
import { Card } from 'src/components/card';
import { Link } from 'src/components/link';
import { MemberAvatarName } from 'src/components/member-avatar-name';
import { RichText } from 'src/components/rich-text';
import { FormattedDate } from 'src/intl/formatted';
import { createTranslate } from 'src/intl/translate';

import { PublishButton } from './components/publish-button';

const T = createTranslate('pages.home');
const TNav = createTranslate('layout.navigation');

export function Home() {
  return (
    <div class="mt-8 row gap-8">
      <Navigation />

      <div class="col flex-1 gap-8">
        <div class="row flex-wrap items-center justify-between gap-4">
          <h1>
            <T id="title" />
          </h1>

          <PublishButton />
        </div>

        <Information />
      </div>
    </div>
  );
}

function Navigation() {
  return (
    <nav class="hidden w-full max-w-xs gap-6 md:col">
      <LinkCard
        href={routes.members.list}
        label={<TNav id="members.label" />}
        description={<TNav id="members.description" />}
        icon={users}
      />

      <LinkCard
        href={routes.requests.list}
        label={<TNav id="requests.label" />}
        description={<TNav id="requests.description" />}
        icon={handRaised}
      />

      <LinkCard
        href={routes.events.list}
        label={<TNav id="events.label" />}
        description={<TNav id="events.description" />}
        icon={calendar}
      />

      <LinkCard
        href={routes.interests}
        label={<TNav id="interests.label" />}
        description={<TNav id="interests.description" />}
        icon={sparkles}
      />

      <LinkCard
        href={routes.misc}
        label={<TNav id="misc.label" />}
        description={<TNav id="misc.description" />}
        icon={star}
      />
    </nav>
  );
}

type LinkCardProps = {
  href: string;
  label: JSX.Element;
  description: JSX.Element;
  icon: ComponentProps<typeof Icon>['path'];
  class?: string;
};

function LinkCard(props: LinkCardProps) {
  return (
    <Link
      href={props.href}
      class={clsx(
        'group row items-center gap-4 rounded-lg border border-primary bg-linear-to-tl from-primary/0 to-primary/10 px-6 py-4 transition-all hover:bg-primary/10 hover:shadow-lg',
        props.class,
      )}
    >
      <div>
        <Icon
          path={props.icon}
          class="size-8 text-gray-400 transition-colors group-hover:text-primary dark:group-hover:text-text"
        />
      </div>
      <div>
        <div class="text-xl font-semibold">{props.label}</div>
        <div class="mt-1 text-dim group-hover:text-primary dark:group-hover:text-text">
          {props.description}
        </div>
      </div>
    </Link>
  );
}

function Information() {
  const information = useQuery(() => apiQuery('listInformation', {}));

  return (
    <Show when={information.data}>
      {(information) => (
        <For each={information().notPin}>
          {(info) => (
            <Card
              title={
                <div class="row items-end justify-between">
                  <MemberAvatarName member={info.author} />
                  <div class="text-sm font-normal">
                    <FormattedDate date={info.publishedAt} dateStyle="medium" timeStyle="short" />
                  </div>
                </div>
              }
            >
              <RichText>{info.body}</RichText>
            </Card>
          )}
        </For>
      )}
    </Show>
  );
}
