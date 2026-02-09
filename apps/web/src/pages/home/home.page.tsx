import { entries } from '@sel/utils';
import { Icon } from 'solid-heroicons';
import { arrowRight } from 'solid-heroicons/solid';

import { api } from 'src/application/api';
import { routes } from 'src/application/routes';
import { card } from 'src/components/card';
import { Link } from 'src/components/link';
import { List } from 'src/components/list';
import { TransactionDialog } from 'src/components/transaction-dialog';
import { createTranslate } from 'src/intl/translate';
import { useSearchParam } from 'src/utils/search-param';

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
    </div>
  );
}

function QuickAccess() {
  const links = {
    createTransaction: `${routes.home}?create=transaction`,
    createInformation: routes.information.create,
    createRequest: routes.requests.create,
    createEvent: routes.events.create,
    editProfile: routes.profile.edition,
    documents: routes.documents,
    help: routes.misc,
  };

  return (
    <section class={card.content({ class: 'sticky top-4 hidden w-full max-w-xs gap-4 self-start md:col' })}>
      <h2 class={card.title()}>
        <T id="quickAccess.title" />
      </h2>

      <List each={entries(links)} class="col gap-3">
        {([item, link]) => (
          <li>
            <Link
              href={link}
              class="inline-flex flex-row items-center gap-2 font-medium text-link hover:underline"
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
