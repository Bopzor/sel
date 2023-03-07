import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';

import { BackLink } from '../../../../app/components/back-link';
import { FallbackSpinner } from '../../../../app/components/fallback';
import { Show } from '../../../../app/components/show';
import { useQuery } from '../../../../app/hooks/use-query';
import { Translation, useTranslate } from '../../../../app/i18n.context';
import { TOKENS } from '../../../../tokens';

import { MembersList } from './members-list';

const T = Translation.create('members');

const MembersListPage = () => {
  const [search, setSearch] = useState('');
  const [members] = useQuery(TOKENS.listMembersHandler, { search });

  return (
    <>
      <BackLink href="/" />

      <div className="row items-start gap-4">
        <div className="card flex-1 p-1">
          <SearchMemberInput search={search} onSearch={setSearch} />
          <Show when={members} fallback={<FallbackSpinner />}>
            {(members) => <MembersList members={members} />}
          </Show>

          <Show when={members?.length === 0}>
            <div className="py-1 text-center text-sm font-medium text-muted">
              <T>No members match this search query</T>
            </div>
          </Show>
        </div>
        <div className="flex-3 min-h-[400px] bg-inverted/10" />
      </div>
    </>
  );
};

export const Page = MembersListPage;

type SearchMemberInputProps = {
  search: string;
  onSearch: (value: string) => void;
};

const SearchMemberInput = ({ search, onSearch }: SearchMemberInputProps) => {
  const t = useTranslate('common');

  return (
    <div className="row mb-1 gap-0.5 border-b-2 py-0.5 focus-within:border-b-primary">
      <MagnifyingGlassIcon className="h-1.5 w-1.5 fill-icon" />
      <input
        type="search"
        placeholder={t('Search')}
        className="outline-none"
        value={search}
        onChange={(event) => onSearch(event.target.value)}
      />
    </div>
  );
};
