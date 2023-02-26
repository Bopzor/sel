import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/solid';

import { useQuery } from '../../../../app/api.context';
import { BackLink } from '../../../../app/components/back-link';
import { LinkButton } from '../../../../app/components/button';
import { FallbackSpinner } from '../../../../app/components/fallback';
import { For } from '../../../../app/components/for';
import { Input } from '../../../../app/components/input';
import { T, useTranslate } from '../../../../app/i18n.context';
import { RequestCard } from '../../components/request-card';
import { ListRequestsHandler } from '../../use-cases/list-requests/list-requests';

export const Page = () => {
  const t = useTranslate('common');
  const [requests] = useQuery(ListRequestsHandler, {});

  return (
    <>
      <BackLink href="/" />

      <div className="row items-stretch gap-2">
        <Input
          type="search"
          placeholder={t('Search') ?? undefined}
          start={<MagnifyingGlassIcon className="h-1.5 w-1.5 fill-icon" />}
          width="full"
        />

        <LinkButton href="/demandes/créer">
          <PlusIcon className="h-1.5 w-1.5" />
          <T ns="requests">Create a request</T>
        </LinkButton>
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
