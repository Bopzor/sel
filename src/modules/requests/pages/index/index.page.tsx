import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';

import { BackLink } from '../../../../app/components/back-link';
import { LinkButton } from '../../../../app/components/button';
import { FallbackSpinner } from '../../../../app/components/fallback';
import { For } from '../../../../app/components/for';
import { Input } from '../../../../app/components/input';
import { useQuery } from '../../../../app/hooks/use-query';
import { Translation, useTranslate } from '../../../../app/i18n.context';
import { TOKENS } from '../../../../tokens';

import { RequestItemCard } from './request-item-card';

const T = Translation.create('requests');

export const Page = () => {
  const t = useTranslate('common');
  const [search, setSearch] = useState('');
  const [requests] = useQuery(TOKENS.listRequestsHandler, { search });

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const value = event.target.value;

    setSearch(value);
  };

  return (
    <>
      <BackLink href="/" />

      <div className="col items-start gap-2 md:flex-row-reverse md:items-stretch">
        <LinkButton href="/demandes/créer">
          <PlusIcon className="h-1.5 w-1.5 fill-white" />
          <T>Create a request</T>
        </LinkButton>

        <Input
          type="search"
          placeholder={t('Search')}
          start={<MagnifyingGlassIcon className="h-1.5 w-1.5 fill-icon" />}
          width="full"
          value={search}
          onChange={handleChange}
        />
      </div>

      <For each={requests} fallback={<FallbackSpinner />}>
        {(request) => (
          <a key={request.id} href={`/demandes/${request.id}`}>
            <RequestItemCard request={request} />
          </a>
        )}
      </For>
    </>
  );
};
