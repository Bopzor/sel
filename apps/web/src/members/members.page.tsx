import { Member } from '@sel/shared';
import { Icon } from 'solid-heroicons';
import { magnifyingGlass } from 'solid-heroicons/solid';
import { Component, createEffect, createMemo, createSignal, For, Setter } from 'solid-js';

import { BackLink } from '../components/back-link';
import { Link } from '../components/link';
import { Map, MapMarker } from '../components/map';
import { MemberAddress } from '../components/member-address';
import { MemberAvatarName } from '../components/member-avatar-name';
import { selector } from '../store/selector';
import { store } from '../store/store';

import { selectFilteredMembers } from './members.slice';
import { fetchMembers } from './use-cases/fetch-members/fetch-members';

export const MembersPage: Component = () => {
  const [search, setSearch] = createSignal('');

  // eslint-disable-next-line solid/reactivity
  const members = selector((state) => selectFilteredMembers(state, search()));

  createEffect(() => {
    void store.dispatch(fetchMembers());
  });

  const [openPopup, setOpenPopup] = createSignal<Member>();

  const markers = createMemo(() =>
    members().map((member): MapMarker<Member> => ({ position: member.address.position, payload: member }))
  );

  return (
    <>
      <BackLink href="/" />

      <div class="col md:row gap-6">
        <MembersList members={members()} search={search()} onSearch={setSearch} onHighlight={setOpenPopup} />
        <Map
          center={[43.836, 5.042]}
          markers={markers()}
          openPopup={openPopup()}
          getPopup={(member) => (
            <div class="col min-w-[12rem] gap-2">
              <div class="text-base font-medium">
                <MemberAvatarName member={member} />
              </div>
              <hr />
              <MemberAddress address={member.address} />
            </div>
          )}
          class="min-h-[600px] flex-1 rounded-lg shadow"
        />
      </div>
    </>
  );
};

type MembersListProps = {
  members: Member[];
  search: string;
  onSearch: Setter<string>;
  onHighlight: (member: Member | undefined) => void;
};

const MembersList: Component<MembersListProps> = (props) => {
  return (
    <div class="card w-full self-start overflow-hidden md:w-[22rem]">
      <SearchMemberInput search={props.search} onSearch={props.onSearch} />

      <ul onMouseLeave={() => props.onHighlight(undefined)}>
        <For each={props.members}>
          {(member) => <MembersListItem member={member} onHighlight={() => props.onHighlight(member)} />}
        </For>
      </ul>
    </div>
  );
};

type MembersListItemProps = {
  member: Member;
  onHighlight: () => void;
};

const MembersListItem: Component<MembersListItemProps> = (props) => (
  <li onMouseEnter={() => props.onHighlight()}>
    <Link
      unstyled
      href={`/membre/${props.member.id}`}
      class="row items-center gap-2 px-4 py-2 hover:bg-inverted/5"
    >
      <MemberAvatarName member={props.member} />
    </Link>
  </li>
);

type SearchMemberInputProps = {
  search: string;
  onSearch: Setter<string>;
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
