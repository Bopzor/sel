import { type Component } from 'solid-js';

import { Header } from './layout/header/header';
import { MembersPage } from './members/members.page';

export const App: Component = () => {
  return (
    <div class="col">
      <Header />

      <div class="p-8">
        <MembersPage />
      </div>
    </div>
  );
};
