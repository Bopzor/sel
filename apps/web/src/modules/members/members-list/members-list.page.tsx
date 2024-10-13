import { Member, MembersSort } from '@sel/shared';
import { parseEnumValue } from '@sel/utils';
import { createQuery } from '@tanstack/solid-query';
import { Show, createSignal } from 'solid-js';

import { Breadcrumb, breadcrumb } from '../../../components/breadcrumb';
import { container } from '../../../infrastructure/container';
import { useSearchParam } from '../../../infrastructure/router/use-search-param';
import { TOKENS } from '../../../tokens';
import { filteredMemberList } from '../filter-member-list';

import { MembersList } from './members-list';
import { MembersMap } from './members-map';

export default function MembersListPage() {
  const api = container.resolve(TOKENS.api);
  const [sort, setSort] = useSearchParam('sort', parseEnumValue(MembersSort));

  const query = createQuery(() => ({
    queryKey: ['listMembers', sort()],
    queryFn: () => api.listMembers({ query: { sort: sort() } }),
  }));

  return (
    <>
      <Breadcrumb items={[breadcrumb.members()]} />

      <Show when={query.data}>
        {(members) => <MembersListContent members={members()} sort={sort()} setSort={setSort} />}
      </Show>
    </>
  );
}

type MembersListContentProps = {
  members: Member[];
  sort: MembersSort | undefined;
  setSort: (sort: MembersSort | undefined) => void;
};

function MembersListContent(props: MembersListContentProps) {
  const [search, setSearch] = useSearchParam('search', (value) => value ?? '');
  const [openPopupMember, setOpenPopupMember] = createSignal<Member>();

  return (
    <>
      <div class="row grow gap-6">
        <div class="col min-h-sm grow gap-4 md:max-w-sm">
          <MembersList
            members={filteredMemberList(props.members, search())}
            onHighlight={setOpenPopupMember}
            sort={props.sort}
            onSort={props.setSort}
            search={search()}
            onSearch={setSearch}
          />
        </div>

        <div class="md:col hidden grow">
          <MembersMap members={props.members} openPopupMember={openPopupMember()} />
        </div>
      </div>
    </>
  );
}
