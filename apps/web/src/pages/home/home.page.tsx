import { entries } from '@sel/utils';
import { useQuery } from '@tanstack/solid-query';
import { Icon } from 'solid-heroicons';
import { arrowRight } from 'solid-heroicons/solid';
import { For, Show } from 'solid-js';

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

export function Home() {
  return (
    <div class="mt-8 row gap-8">
      <QuickAccess />

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

function QuickAccess() {
  const links = {
    createTransaction: '/?create=transaction',
    createInformation: '/?create=information',
    createRequest: routes.requests.create,
    createEvent: routes.events.create,
    editProfile: routes.profile.edition,
    search: '/',
    help: routes.misc,
  };

  return (
    <section class="sticky top-4 hidden w-full max-w-xs gap-4 self-start rounded-md bg-primary/5 p-6 md:col">
      <h2 class="text-xl font-semibold text-dim">
        <T id="quickAccess.title" />
      </h2>

      <ul class="col gap-3">
        <For each={entries(links)}>
          {([item, link]) => (
            <li>
              <Link href={link} class="row items-center gap-2 hover:underline">
                <Icon path={arrowRight} class="size-4" />
                <T id={`quickAccess.items.${item}`} />
              </Link>
            </li>
          )}
        </For>
      </ul>
    </section>
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
              <Link href={`/information/${info.id}`}>
                <RichText>{info.body}</RichText>
              </Link>
            </Card>
          )}
        </For>
      )}
    </Show>
  );
}
