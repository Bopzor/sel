import { defined } from '@sel/utils';
import { Component, JSX, Show } from 'solid-js';

import { VerifyAuthenticationToken } from '../authentication/verify-authentication-token';
import { useSearchParam } from '../infrastructure/router/use-search-param';

import { Header } from './header/header';

type LayoutProps = {
  children: JSX.Element;
};

export const Layout: Component<LayoutProps> = (props) => {
  const [authToken, setAuthToken] = useSearchParam('auth-token');

  return (
    <Show
      when={!authToken()}
      fallback={
        <VerifyAuthenticationToken token={defined(authToken())} onVerified={() => setAuthToken(undefined)} />
      }
    >
      <Header />
      <main class="col mx-auto w-full max-w-[1300px] flex-1 px-4 pb-4">{props.children}</main>
    </Show>
  );
};
