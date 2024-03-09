import { Member, MembersSort } from '@sel/shared';
import { parseEnumValue } from '@sel/utils';
import { Show, createResource, createSignal } from 'solid-js';

import { Breadcrumb, breadcrumb } from '../../../components/breadcrumb';
import { container } from '../../../infrastructure/container';
import { useSearchParam } from '../../../infrastructure/router/use-search-param';
import { TOKENS } from '../../../tokens';

import { MembersList } from './members-list';
import { MembersMap } from './members-map';

const defaultSort = Symbol();

export default function MembersListPage() {
  const memberApi = container.resolve(TOKENS.memberApi);
  const [sort, setSort] = useSearchParam('sort', parseEnumValue(MembersSort));

  const [members] = createResource(
    () => sort() ?? defaultSort,
    async (sort) => {
      return memberApi.listMembers(sort === defaultSort ? undefined : sort);
    },
  );

  return (
    <>
      <Breadcrumb items={[breadcrumb.members()]} />

      <Show when={members()}>
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

  const filteredMembers = () => {
    return props.members.filter((member) =>
      [member.firstName, member.lastName].some((value) =>
        value.toLowerCase().includes(search().toLowerCase()),
      ),
    );
  };

  return (
    <>
      <div class="row grow gap-6">
        <div class="col min-h-sm grow gap-4 md:max-w-sm">
          <MembersList
            members={filteredMembers()}
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
