import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';

import { BackLink } from '../../../../app/components/back-link';
import { FallbackSpinner } from '../../../../app/components/fallback';
import { Show } from '../../../../app/components/show';
import { useQuery } from '../../../../app/hooks/use-query';
import { Translation, useTranslate } from '../../../../app/i18n.context';
import { TOKENS } from '../../../../tokens';
import { Members } from '../../aliases';

import { MembersList } from './members-list';
import { MembersMap } from './members-map';

const T = Translation.create('members');

const MembersListPage = () => {
  const [activeMember, setActiveMember] = useState<Members[number]>();
  const [search, setSearch] = useState('');
  const [members] = useQuery(TOKENS.listMembersHandler, { search });

  return (
    <>
      <BackLink href="/" />

      <div className="col md:row gap-3 overflow-hidden pb-1 md:h-[36rem] md:items-start">
        <div className="card col max-h-full md:w-[22rem]">
          <SearchMemberInput search={search} onSearch={setSearch} />
          <Show when={members} fallback={<FallbackSpinner />}>
            {(members) => <MembersList members={members} setActive={setActiveMember} />}
          </Show>

          <Show when={members?.length === 0}>
            <div className="py-2 px-1 text-center text-sm font-medium text-muted">
              <T>No members match this search query</T>
            </div>
          </Show>
        </div>

        <div className="md:col h-[24rem] md:h-[36rem] md:flex-1 md:pb-1">
          <MembersMap members={members ?? []} popupOpen={activeMember?.id} />
        </div>
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
    <div className="row mx-1 my-0.5 gap-0.5 border-b-2 py-0.5 focus-within:border-b-primary">
      <div>
        <MagnifyingGlassIcon className="h-1.5 w-1.5 fill-icon" />
      </div>
      <input
        type="search"
        placeholder={t('Search')}
        className="w-full flex-1 outline-none"
        value={search}
        onChange={(event) => onSearch(event.target.value)}
      />
    </div>
  );
};
