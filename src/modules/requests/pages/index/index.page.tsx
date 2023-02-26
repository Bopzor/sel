import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/solid';

import { useQuery } from '../../../../app/api.context';
import { BackLink } from '../../../../app/components/back-link';
import { LinkButton } from '../../../../app/components/button';
import { FallbackSpinner } from '../../../../app/components/fallback';
import { For } from '../../../../app/components/for';
import { Input } from '../../../../app/components/input';
import { Translation, useTranslate } from '../../../../app/i18n.context';
import { RequestCard } from '../../components/request-card';
import { ListRequestsHandler } from '../../use-cases/list-requests/list-requests';

const T = Translation.create('requests');

export const Page = () => {
  const t = useTranslate('common');
  const [requests] = useQuery(ListRequestsHandler, {});

  return (
    <>
      <BackLink href="/" />

      <div className="col items-start gap-2 md:flex-row-reverse md:items-stretch">
        <LinkButton href="/demandes/créer">
          <PlusIcon className="h-1.5 w-1.5" />
          <T>Create a request</T>
        </LinkButton>

        <Input
          type="search"
          placeholder={t('Search')}
          start={<MagnifyingGlassIcon className="h-1.5 w-1.5 fill-icon" />}
          width="full"
        />
      </div>

      <For each={requests} fallback={<FallbackSpinner />}>
        {(request) => (
          <a key={request.id} href={`/demandes/${request.id}`}>
            <RequestCard request={request} clampDescription />
          </a>
        )}
      </For>
    </>
  );
};