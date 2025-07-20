import { Member, MembersSort } from '@sel/shared';
import { Icon } from 'solid-heroicons';
import { magnifyingGlass, mapPin } from 'solid-heroicons/solid';
import { For, Show } from 'solid-js';

import { Card, CardFallback } from 'src/components/card';
import { Input } from 'src/components/input';
import { MemberAvatarName } from 'src/components/member-avatar-name';
import { TranslateMembersSort } from 'src/intl/enums';
import { createTranslate } from 'src/intl/translate';

const T = createTranslate('pages.members.list');
const Translate = createTranslate('common');

type MemberListProps = {
  members: Member[];
  onHighlight: (member: Member | undefined) => void;
  sort: MembersSort | undefined;
  onSort: (sort: MembersSort | undefined) => void;
  search: string;
  onSearch: (search: string) => void;
};

export function MemberList(props: MemberListProps) {
  return (
    <>
      <SearchInput search={props.search} onSearch={props.onSearch} />

      <Card padding={false}>
        <div class="px-4 py-3 shadow-sm">
          <SortControl sort={props.sort} onSort={props.onSort} />
        </div>

        <Show
          when={props.members.length > 0}
          fallback={
            <CardFallback>
              <T id="empty" />
            </CardFallback>
          }
        >
          <ul onMouseLeave={() => props.onHighlight(undefined)}>
            <For each={props.members}>
              {(member) => <MemberItem member={member} onHighlight={() => props.onHighlight(member)} />}
            </For>
          </ul>
        </Show>
      </Card>
    </>
  );
}

function SearchInput(props: { search: string; onSearch: (search: string) => void }) {
  const t = Translate.useTranslate();

  return (
    <Input
      type="search"
      placeholder={t('search')}
      value={props.search}
      onInput={(event) => props.onSearch(event.target.value)}
      start={<Icon path={magnifyingGlass} class="size-5 text-dim" />}
    />
  );
}

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
  const t = T.useTranslate();

  return (
    <li class="group row items-center justify-between hover:bg-inverted/5 focus:bg-inverted/5">
      <MemberAvatarName number member={props.member} classes={{ root: 'px-4 py-2' }} />

      {props.member.address && (
        <button
          class="group/button invisible group-hover:visible"
          title={t('showOnMap')}
          onClick={() => props.onHighlight()}
        >
          <Icon path={mapPin} class="mx-4 size-5 text-dim group-hover/button:text-primary" />
        </button>
      )}
    </li>
  );
}
