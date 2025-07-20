import { entries } from '@sel/utils';
import { Icon } from 'solid-heroicons';
import { arrowRight } from 'solid-heroicons/solid';
import { For } from 'solid-js';

import { api } from 'src/application/api';
import { routes } from 'src/application/routes';
import { Link } from 'src/components/link';
import { TransactionDialog } from 'src/components/transaction-dialog';
import { createTranslate } from 'src/intl/translate';
import { useSearchParam } from 'src/utils/search-param';

import { CreateInformationDialog } from './components/create-information-dialog';
import { Feed } from './components/feed';

const T = createTranslate('pages.home');

export function Home() {
  const [create, setCreate] = useSearchParam('create');

  return (
    <div class="mt-8 row gap-8">
      <QuickAccess />
      <Feed />

      <TransactionDialog
        open={create() === 'transaction'}
        onClose={() => setCreate(undefined)}
        onCreate={(values) => api.createTransaction({ body: values })}
      />

      <CreateInformationDialog open={create() === 'information'} onClose={() => setCreate(undefined)} />
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
