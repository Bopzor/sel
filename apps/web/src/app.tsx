import { Route, Routes } from '@solidjs/router';
import { lazy, type Component } from 'solid-js';

import { Header } from './layout/header/header';

const HomePage = lazyImport('./home-page', 'HomePage');
const MembersPage = lazyImport('./members/members.page', 'MembersPage');
const MemberPage = lazyImport('./members/member.page', 'MemberPage');

function lazyImport(path: string, name: string) {
  return lazy(() => import(path).then((module) => ({ default: module[name] })));
}

export const App: Component = () => {
  return (
    <>
      <Header />

      <main class="mx-auto max-w-[1300px] px-4 py-8">
        <Routes>
          <Route path="/" component={HomePage} />
          <Route path="/membres" component={MembersPage} />
          <Route path="/membre/:memberId" component={MemberPage} />
        </Routes>
      </main>
    </>
  );
};
