import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';

import { useQuery } from '../../../../app/api.context';
import { BackLink } from '../../../../app/components/back-link';
import { For } from '../../../../app/components/for';
import { Input } from '../../../../app/components/input';
import { useTranslate } from '../../../../app/i18n.context';
import { RequestCard } from '../../components/request-card';
import { ListRequestsHandler } from '../../use-cases/list-requests/list-requests';

export const Page = () => {
  const t = useTranslate('common');
  const [requests] = useQuery(ListRequestsHandler, {});

  return (
    <>
      <BackLink href="/" />

      <Input
        type="search"
        placeholder={t('Search') ?? undefined}
        start={<MagnifyingGlassIcon className="h-1.5 w-1.5 fill-icon" />}
      />

      <For fallback={<>loading</>} each={requests}>
        {(request) => (
          <a key={request.id} href={`/demandes/${request.id}`}>
            <RequestCard request={request} clampDescription />
          </a>
        )}
      </For>
    </>
  );
};
