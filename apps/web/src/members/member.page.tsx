import { useParams } from '@solidjs/router';
import { Component, createEffect, Show } from 'solid-js';

import { selector } from '../store/selector';
import { store } from '../store/store';

import { selectMemberUnsafe } from './members.slice';
import { fetchMember } from './use-cases/fetch-member/fetch-member';

export const MemberPage: Component = () => {
  const { memberId } = useParams<{ memberId: string }>();
  const member = selector((state) => selectMemberUnsafe(state, memberId));

  createEffect(() => {
    if (!member()) {
      void store.dispatch(fetchMember(memberId));
    }
  });

  return (
    <Show when={member()} fallback={<>Loading...</>}>
      {(member) => (
        <div class="row">
          <div>{memberId}</div>
        </div>
      )}
    </Show>
  );
};
