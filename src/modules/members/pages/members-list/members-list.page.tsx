import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';

import { BackLink } from '../../../../app/components/back-link';
import { FallbackSpinner } from '../../../../app/components/fallback';
import { Show } from '../../../../app/components/show';
import { useQuery } from '../../../../app/hooks/use-query';
import { useTranslate } from '../../../../app/i18n.context';
import { TOKENS } from '../../../../tokens';

import { MembersList } from './members-list';

const MembersListPage = () => {
  const [members] = useQuery(TOKENS.listMembersHandler, {});

  return (
    <>
      <BackLink href="/" />

      <Show when={members} fallback={<FallbackSpinner />}>
        {(members) => (
          <div className="row items-start gap-4">
            <div className="card flex-1 p-1">
              <SearchMemberInput />
              <MembersList members={members} />
            </div>
            <div className="flex-3 min-h-[400px] bg-inverted/10" />
          </div>
        )}
      </Show>
    </>
  );
};

export const Page = MembersListPage;

const SearchMemberInput = () => {
  const t = useTranslate('common');

  return (
    <div className="row mb-1 gap-0.5 border-b-2 py-0.5 focus-within:border-b-primary">
      <MagnifyingGlassIcon className="h-1.5 w-1.5 fill-icon" />
      <input type="search" placeholder={t('Search')} className="outline-none" />
    </div>
  );
};
