import { Member } from '@sel/shared';
import { Icon } from 'solid-heroicons';
import { magnifyingGlass } from 'solid-heroicons/solid';
import { Component, createEffect, createSignal, For } from 'solid-js';

import { Map } from '../components/map';
import { MemberAvatar } from '../components/member-avatar';
import { selector } from '../store/selector';
import { store } from '../store/store';

import { selectFilteredMembers } from './members.slice';
import { fetchMembers } from './use-cases/fetch-members/fetch-members';

export const MembersPage: Component = () => {
  createEffect(() => {
    void store.dispatch(fetchMembers());
  });

  return (
    <div class="col md:row gap-6">
      <MembersList />
      <Map center={[43.836, 5.042]} class="min-h-[600px] flex-1 rounded-lg shadow outline-none" />
    </div>
  );
};

const MembersList: Component = () => {
  const [search, setSearch] = createSignal('');

  // eslint-disable-next-line solid/reactivity
  const members = selector((state) => selectFilteredMembers(state, search()));

  return (
    <div class="w-full self-start overflow-hidden rounded-lg bg-neutral shadow md:w-[22rem]">
      <SearchMemberInput search={search()} onSearch={setSearch} />

      <ul>
        <For each={members()}>{(member) => <MembersListItem member={member} />}</For>
      </ul>
    </div>
  );
};

const MembersListItem: Component<{ member: Member }> = (props) => (
  <li>
    <a href="#" class="row items-center gap-2 px-4 py-2 hover:bg-inverted/5">
      <MemberAvatar class="inline-block h-8 w-8 rounded-full" member={props.member} />
      {props.member.firstName} {props.member.lastName}
    </a>
  </li>
);

type SearchMemberInputProps = {
  search: string;
  onSearch: (value: string) => void;
};

const SearchMemberInput: Component<SearchMemberInputProps> = (props) => {
  return (
    <div class="row mx-4 my-2 gap-1 border-b-2 py-1 transition-colors focus-within:border-b-primary">
      <div>
        <Icon path={magnifyingGlass} class="h-5 w-5 fill-icon" />
      </div>

      <input
        type="search"
        placeholder="Rechercher"
        class="flex-1 outline-none"
        value={props.search}
        onInput={(event) => props.onSearch(event.target.value)}
      />
    </div>
  );
};
