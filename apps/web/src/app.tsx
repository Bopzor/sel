import { createEffect, type Component } from 'solid-js';

import { Fetcher } from './fetcher';
import { ApiMembersGateway } from './members/api-members.gateway';
import { fetchMembers } from './members/use-cases/fetch-members/fetch-members';
import { createStore } from './store/create-store';

const fetcher = new Fetcher();

const store = createStore({
  membersGateway: new ApiMembersGateway(fetcher),
});

export const App: Component = () => {
  createEffect(() => {
    void store.dispatch(fetchMembers());
  });

  return <div class="col">SEL</div>;
};
