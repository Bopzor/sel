import { Member } from '@sel/shared';
import { defined } from '@sel/utils';
import { Icon } from 'solid-heroicons';
import { magnifyingGlass } from 'solid-heroicons/solid';
import { Component, For, Setter, createEffect, createSignal } from 'solid-js';

import { BackLink } from '../components/back-link';
import { Link } from '../components/link';
import { Map } from '../components/map';
import { MemberAddress } from '../components/member-address';
import { MemberAvatarName } from '../components/member-avatar-name';
import { useTranslation } from '../intl/translate';
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

  const [openPopupMember, setOpenPopupMember] = createSignal<Member>();

  return (
    <>
      <BackLink href="/" />

      <div class="col md:row gap-6 md:h-[32rem]">
        <MembersList
          members={members()}
          search={search()}
          onSearch={setSearch}
          onHighlight={setOpenPopupMember}
        />

        <MemberMap members={members()} openPopupMember={openPopupMember()} />
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
    <div class="card col max-h-[24rem] w-full self-start md:max-h-full md:w-[22rem]">
      <div class="shadow">
        <SearchMemberInput search={props.search} onSearch={props.onSearch} />
      </div>

      <div class="flex-1 overflow-auto">
        <ul onMouseLeave={() => props.onHighlight(undefined)}>
          <For each={props.members}>
            {(member) => <MembersListItem member={member} onHighlight={() => props.onHighlight(member)} />}
          </For>
        </ul>
      </div>
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
      tabIndex={0}
      class="row items-center gap-2 px-4 py-2 hover:bg-inverted/5 focus:bg-inverted/5 focus:outline-none"
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
  const t = useTranslation();

  return (
    <div class="row mx-4 my-2 gap-1 border-b-2 py-1 transition-colors focus-within:border-b-primary">
      <div>
        <Icon path={magnifyingGlass} class="h-5 w-5 fill-icon" />
      </div>

      <input
        type="search"
        placeholder={t('common.search')}
        class="flex-1 outline-none"
        value={props.search}
        onInput={(event) => props.onSearch(event.target.value)}
      />
    </div>
  );
};

type MemberMapProps = {
  members: Member[];
  openPopupMember?: Member;
};

const MemberMap: Component<MemberMapProps> = (props) => {
  return (
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
      class="h-full min-h-[24rem] flex-1 overflow-hidden rounded-lg shadow"
    />
  );
};

type PopupProps = {
  member: Member;
};

const Popup: Component<PopupProps> = (props) => {
  return (
    <Link unstyled href={`/membre/${props.member.id}`} class="col min-w-[12rem] gap-2 outline-none">
      <div class="row items-center gap-2 text-base font-medium">
        <MemberAvatarName member={props.member} />
      </div>

      <hr />

      <MemberAddress address={defined(props.member.address)} />
    </Link>
  );
};
