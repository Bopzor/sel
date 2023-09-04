import { Member } from '@sel/shared';
import { Component, createEffect, For } from 'solid-js';

import { MemberAvatar } from '../components/member-avatar';
import { selector } from '../store/selector';
import { store } from '../store/store';

import { selectMembers } from './members.slice';
import { fetchMembers } from './use-cases/fetch-members/fetch-members';

export const MembersPage: Component = () => {
  createEffect(() => {
    void store.dispatch(fetchMembers());
  });

  return (
    <div class="col md:row gap-4">
      <MembersList />
      <div class="h-10 flex-1 bg-inverted/10" />
    </div>
  );
};

const MembersList: Component = () => {
  const members = selector(selectMembers);

  return (
    <ul class="w-[22rem] overflow-hidden rounded bg-neutral shadow">
      <For each={members()}>{(member) => <MembersListItem member={member} />}</For>
    </ul>
  );
};

const MembersListItem: Component<{ member: Member }> = (props) => (
  <li>
    <a href="#" class="row gap-2 p-2 hover:bg-inverted/5">
      <MemberAvatar class="inline-block h-8 w-8 rounded-full" member={props.member} />
      {props.member.firstName} {props.member.lastName}
    </a>
  </li>
);
