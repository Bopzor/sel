import { Member, MembersSort } from '@sel/shared';
import { defined, parseEnumValue } from '@sel/utils';
import clsx from 'clsx';
import { Icon } from 'solid-heroicons';
import { magnifyingGlass, mapPin } from 'solid-heroicons/solid';
import { Component, For, createSignal } from 'solid-js';

import { Async } from '../components/async';
import { BackLink } from '../components/back-link';
import { Input } from '../components/input';
import { Link } from '../components/link';
import { Map } from '../components/map';
import { MemberAddress } from '../components/member-address';
import { MemberAvatarName } from '../components/member-avatar-name';
import { Row } from '../components/row';
import { useSearchParam } from '../infrastructure/router/use-search-param';
import { Translate, useTranslation } from '../intl/translate';
import { routes } from '../routes';
import { createDebouncedValue } from '../utils/debounce';
import { query } from '../utils/query';

const T = Translate.prefix('members');

export const MembersPage: Component = () => {
  const [getSearch, setSearch] = useSearchParam('search', (value) => value ?? '');
  const [getSort, setSort] = useSearchParam('sort', parseEnumValue(MembersSort));

  const membersQuery = query((fetcher) => ({
    key: ['members', { sort: getSort(), a: Math.random() }],
    query: () => {
      let endpoint = '/api/members';
      const search = new URLSearchParams();
      const sort = getSort();

      if (sort) {
        search.set('sort', sort);
      }

      if (search.size > 0) {
        endpoint += `?${search}`;
      }

      return fetcher.get<Member[]>(endpoint).body();
    },
  }));

  const [openPopupMember, setOpenPopupMember] = createSignal<Member>();

  return (
    <>
      <BackLink href={routes.home} />

      <Async query={membersQuery}>
        {(members) => (
          <div class="row flex-1 gap-6">
            <MembersList
              members={members}
              loading={membersQuery.isFetching}
              search={getSearch()}
              onSearch={setSearch}
              sort={getSort() ?? MembersSort.firstName}
              onSort={setSort}
              onHighlight={setOpenPopupMember}
            />

            <MemberMap members={members} openPopupMember={openPopupMember()} />
          </div>
        )}
      </Async>
    </>
  );
};

type MembersListProps = {
  members: Member[];
  loading: boolean;
  search: string;
  onSearch: (search: string) => void;
  sort?: MembersSort;
  onSort: (sort: MembersSort | undefined) => void;
  onHighlight: (member: Member | undefined) => void;
};

const MembersList: Component<MembersListProps> = (props) => {
  const debouncedLoading = createDebouncedValue(() => props.loading, 200);

  return (
    <div class=" col min-h-[24rem] flex-1 gap-4 md:max-w-sm">
      <SearchMemberInput search={props.search} onSearch={props.onSearch} />

      <div class="card col relative flex-1">
        <div class="px-4 py-3 shadow">
          <SortMembers sort={props.sort} onSort={props.onSort} />
        </div>

        <ul class="h-0 flex-auto overflow-y-auto" onMouseLeave={() => props.onHighlight(undefined)}>
          <For each={props.members}>
            {(member) => <MembersListItem member={member} onHighlight={() => props.onHighlight(member)} />}
          </For>
        </ul>

        <div class="absolute inset-0 bg-neutral/50" classList={{ invisible: !debouncedLoading() }} />
      </div>
    </div>
  );
};

type MembersListItemProps = {
  member: Member;
  onHighlight: () => void;
};

const MembersListItem: Component<MembersListItemProps> = (props) => {
  const t = T.useTranslation();

  return (
    <li class="row group items-center gap-1 px-4 py-2 hover:bg-inverted/5 focus:bg-inverted/5">
      <Link
        unstyled
        href={routes.members.member(props.member.id)}
        tabIndex={0}
        class="row flex-1 items-center gap-2 focus:outline-none"
      >
        <MemberAvatarName member={props.member} />
      </Link>

      {props.member.address && (
        <button
          class="group/button invisible group-hover:visible"
          title={t('showOnMap')}
          onClick={() => props.onHighlight()}
        >
          <Icon path={mapPin} class="h-5 w-5 fill-icon group-hover/button:fill-primary" />
        </button>
      )}
    </li>
  );
};

type SearchMemberInputProps = {
  search: string;
  onSearch: (search: string) => void;
};

const SearchMemberInput: Component<SearchMemberInputProps> = (props) => {
  const t = useTranslation();

  return (
    <Input
      type="search"
      placeholder={t('common.search')}
      value={props.search}
      onInput={(event) => props.onSearch(event.target.value)}
      start={<Icon path={magnifyingGlass} class="h-5 w-5 fill-icon" />}
    />
  );
};

const TranslateMembersSort = Translate.enum<MembersSort>('members.membersSortEnum');

type SortMembersProps = {
  sort?: MembersSort;
  onSort: (sort: MembersSort | undefined) => void;
};

const SortMembers: Component<SortMembersProps> = (props) => (
  <Row gap={4} class="text-sm">
    <span class="text-dim">Trier par:</span>

    <For each={Object.values(MembersSort)}>
      {(sort) => (
        <button class={clsx({ 'font-semibold': props.sort === sort })} onClick={() => props.onSort(sort)}>
          <TranslateMembersSort value={sort} />
        </button>
      )}
    </For>
  </Row>
);

type MemberMapProps = {
  members: Member[];
  openPopupMember?: Member;
};

const MemberMap: Component<MemberMapProps> = (props) => {
  return (
    <div class="hidden flex-1 md:block">
      <Map
        center={props.openPopupMember?.address?.position ?? [5.042, 43.836]}
        zoom={13}
        markers={props.members
          .filter((member) => member.address?.position)
          .map((member) => ({
            position: defined(member.address?.position),
            isPopupOpen: member === props.openPopupMember,
            render: () => <Popup member={member} />,
          }))}
        class="aspect-4/3 max-h-[32rem]"
      />
    </div>
  );
};

type PopupProps = {
  member: Member;
};

const Popup: Component<PopupProps> = (props) => {
  return (
    <Link unstyled href={`/membre/${props.member.id}`} class="col min-w-[12rem] gap-2 outline-none">
      <Row gap={2} class="text-base font-medium">
        <MemberAvatarName member={props.member} />
      </Row>

      <hr />

      <MemberAddress address={defined(props.member.address)} />
    </Link>
  );
};
