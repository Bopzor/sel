import { Route, Routes } from '@solidjs/router';
import { lazy, type Component } from 'solid-js';

import { Header } from './layout/header/header';

const HomePage = lazyImport(() => import('./home/home.page'), 'HomePage');
const RequestsPage = lazyImport(() => import('./requests/requests.page'), 'RequestsPage');
const MembersPage = lazyImport(() => import('./members/members.page'), 'MembersPage');
const MemberPage = lazyImport(() => import('./members/member.page'), 'MemberPage');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function lazyImport(module: () => Promise<any>, name: string) {
  return lazy(() => module().then((module) => ({ default: module[name] })));
}

export const App: Component = () => {
  return (
    <>
      <Header />

      <main class="mx-auto max-w-[1300px] px-4 pb-4">
        <Routes>
          <Route path="/" component={HomePage} />
          <Route path="/demandes" component={RequestsPage} />
          <Route path="/membres" component={MembersPage} />
          <Route path="/membre/:memberId" component={MemberPage} />
        </Routes>
      </main>
    </>
  );
};
