import { defined } from '@sel/utils';
import { Component, JSX, Show, onMount } from 'solid-js';

import { Authentication } from '../authentication/authentication';
import { selectAuthenticatedMemberUnsafe } from '../authentication/authentication.slice';
import { fetchAuthenticatedMember } from '../authentication/use-cases/fetch-authenticated-member/fetch-authenticated-member';
import { VerifyAuthenticationToken } from '../authentication/verify-authentication-token';
import { useSearchParam } from '../infrastructure/router/use-search-param';
import { redirectToOnboardingWhenNotCompleted } from '../onboarding/redirect-to-onboarding';
import { selector } from '../store/selector';
import { store } from '../store/store';

import { Header } from './header/header';

type LayoutProps = {
  children: JSX.Element;
};

export const Layout: Component<LayoutProps> = (props) => {
  const isFetchingAuthenticatedMember = selector(fetchAuthenticatedMember.selectIsPending);

  const member = selector(selectAuthenticatedMemberUnsafe);
  const [authToken, setAuthToken] = useSearchParam('auth-token');

  onMount(() => {
    void store.dispatch(fetchAuthenticatedMember());
  });

  redirectToOnboardingWhenNotCompleted();

  return (
    <Show
      when={!authToken()}
      fallback={
        <VerifyAuthenticationToken token={defined(authToken())} onVerified={() => setAuthToken(undefined)} />
      }
    >
      <Show when={!isFetchingAuthenticatedMember()}>
        <Show when={member()} fallback={<Authentication />}>
          <Header />
          <main class="col mx-auto w-full max-w-[1300px] flex-1 px-4 pb-4">{props.children}</main>
        </Show>
      </Show>
    </Show>
  );
};
