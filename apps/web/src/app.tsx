import { type Component } from 'solid-js';

import { Header } from './layout/header/header';
import { MembersPage } from './members/members.page';

export const App: Component = () => {
  return (
    <>
      <Header />

      <main class="mx-auto max-w-[1300px] px-4 py-8">
        <MembersPage />
      </main>
    </>
  );
};
