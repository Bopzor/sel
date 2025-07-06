import { Member, MembersSort } from '@sel/shared';
import { parseEnumValue, removeDiacriticCharacters } from '@sel/utils';
import { createQuery, keepPreviousData } from '@tanstack/solid-query';
import { createSignal, Show } from 'solid-js';

import { apiQuery } from 'src/application/query';
import { Breadcrumb, breadcrumb } from 'src/components/breadcrumb';
import { BoxSkeleton } from 'src/components/skeleton';
import { useSearchParam } from 'src/utils/search-param';

import { MemberList } from './components/member-list';
import { MembersMap } from './components/members-map';

export function MemberListPage() {
  const [sort, setSort] = useSearchParam('sort', parseEnumValue(MembersSort));
  const [search, setSearch] = useSearchParam('search', (value) => value ?? '');
  const [openPopupMember, setOpenPopupMember] = createSignal<Member>();

  const query = createQuery(() => ({
    ...apiQuery('listMembers', { query: { sort: sort() } }),
    placeholderData: keepPreviousData,
  }));

  return (
    <>
      <Breadcrumb items={[breadcrumb.members()]} />

      <Show when={query.data} fallback={<Skeleton />}>
        {(members) => (
          <div class="row gap-6">
            <div class="col grow gap-4 md:max-w-96">
              <MemberList
                members={filteredMemberList(members(), search())}
                onHighlight={setOpenPopupMember}
                sort={sort()}
                onSort={setSort}
                search={search()}
                onSearch={setSearch}
              />
            </div>

            {/* eslint-disable-next-line tailwindcss/no-arbitrary-value */}
            <div class="hidden h-128 flex-1 md:block">
              <MembersMap members={members()} openPopupMember={openPopupMember()} />
            </div>
          </div>
        )}
      </Show>
    </>
  );
}

function Skeleton() {
  return (
    <div class="row gap-6">
      <div class="col grow gap-4 md:max-w-96">
        <BoxSkeleton height={24} />
      </div>

      {/* eslint-disable-next-line tailwindcss/no-arbitrary-value */}
      <div class="hidden h-128 flex-1 md:block">
        <BoxSkeleton height={32} />
      </div>
    </div>
  );
}

export function filteredMemberList(members: Member[], search: string) {
  return members.filter((member) =>
    [member.firstName, member.lastName]
      .map(removeDiacriticCharacters)
      .some((value) => value.toLowerCase().includes(removeDiacriticCharacters(search.toLowerCase()))),
  );
}
