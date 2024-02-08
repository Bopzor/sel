import { Member, MembersSort } from '@sel/shared';
import { Icon } from 'solid-heroicons';
import { magnifyingGlass, mapPin } from 'solid-heroicons/solid';
import { For } from 'solid-js';

import { Input } from '../../../components/input';
import { Link } from '../../../components/link';
import { MemberAvatarName } from '../../../components/member-avatar-name';
import { Translate, useTranslation } from '../../../intl/translate';
import { routes } from '../../../routes';

const T = Translate.prefix('members.list');

type MembersListProps = {
  members: Member[];
  onHighlight: (member: Member | undefined) => void;
  sort: MembersSort | undefined;
  onSort: (sort: MembersSort | undefined) => void;
  search: string;
  onSearch: (search: string) => void;
};

export function MembersList(props: MembersListProps) {
  return (
    <>
      <SearchInput search={props.search} onSearch={props.onSearch} />

      <div class="card col flex-1">
        <div class="px-4 py-3 shadow">
          <SortControl sort={props.sort} onSort={props.onSort} />
        </div>

        <ul class="h-0 flex-auto overflow-y-auto" onMouseLeave={() => props.onHighlight(undefined)}>
          <For each={props.members}>
            {(member) => <MemberItem member={member} onHighlight={() => props.onHighlight(member)} />}
          </For>
        </ul>
      </div>
    </>
  );
}

function SearchInput(props: { search: string; onSearch: (search: string) => void }) {
  const t = useTranslation();

  return (
    <Input
      type="search"
      placeholder={t('common.search')}
      value={props.search}
      onInput={(event) => props.onSearch(event.target.value)}
      start={<Icon path={magnifyingGlass} class="size-5 fill-icon" />}
    />
  );
}

const TranslateMembersSort = Translate.enum<MembersSort>('members.list.membersSortEnum');

function SortControl(props: { sort?: MembersSort; onSort: (sort: MembersSort | undefined) => void }) {
  return (
    <div class="row gap-4 text-sm">
      <span class="text-dim">
        <T id="sortBy" />
      </span>

      <For each={Object.values(MembersSort)}>
        {(sort) => (
          <button classList={{ 'font-semibold': props.sort === sort }} onClick={() => props.onSort(sort)}>
            <TranslateMembersSort value={sort} />
          </button>
        )}
      </For>
    </div>
  );
}

function MemberItem(props: { member: Member; onHighlight: () => void }) {
  const t = T.useTranslation();

  return (
    <li class="row group items-center hover:bg-inverted/5 focus:bg-inverted/5">
      <Link
        unstyled
        href={routes.members.member(props.member.id)}
        class="row flex-1 items-center gap-2 px-4 py-2 focus:outline-none"
      >
        <MemberAvatarName member={props.member} />
      </Link>

      {props.member.address && (
        <button
          class="group/button invisible group-hover:visible"
          title={t('showOnMap')}
          onClick={() => props.onHighlight()}
        >
          <Icon path={mapPin} class="mx-4 size-5 fill-icon group-hover/button:fill-primary" />
        </button>
      )}
    </li>
  );
}
