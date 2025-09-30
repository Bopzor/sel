import { entries } from '@sel/utils';
import { Icon } from 'solid-heroicons';
import { arrowRight } from 'solid-heroicons/solid';

import { api } from 'src/application/api';
import { routes } from 'src/application/routes';
import { Link } from 'src/components/link';
import { List } from 'src/components/list';
import { SearchDialog } from 'src/components/search-dialog';
import { TransactionDialog } from 'src/components/transaction-dialog';
import { createTranslate } from 'src/intl/translate';
import { useSearchParam } from 'src/utils/search-param';

import { CreateInformationDialog } from './components/create-information-dialog';
import { Feed } from './components/feed';

const T = createTranslate('pages.home');

export function Home() {
  const [create, setCreate] = useSearchParam('create');
  const [search, setSearch] = useSearchParam('search');

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

      <SearchDialog open={search() === 'open'} onClose={() => setSearch(undefined)} />
    </div>
  );
}

function QuickAccess() {
  const links = {
    createTransaction: `${routes.home}?create=transaction`,
    createInformation: `${routes.home}?create=information`,
    createRequest: routes.requests.create,
    createEvent: routes.events.create,
    editProfile: routes.profile.edition,
    search: `${routes.home}?search=open`,
    documents: routes.documents,
    help: routes.misc,
  };

  return (
    <section class="sticky top-4 hidden w-full max-w-xs gap-4 self-start rounded-lg bg-gray-200/50 p-6 shadow-sm md:col dark:bg-neutral/25">
      <h2 class="text-xl font-semibold text-dim">
        <T id="quickAccess.title" />
      </h2>

      <List each={entries(links)} class="col gap-3">
        {([item, link]) => (
          <li>
            <Link
              href={link}
              class="inline-flex flex-row items-center gap-2 font-medium text-primary hover:underline"
            >
              <Icon path={arrowRight} class="size-4" />
              <T id={`quickAccess.items.${item}`} />
            </Link>
          </li>
        )}
      </List>
    </section>
  );
}
