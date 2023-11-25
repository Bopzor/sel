import { Component, JSX, Show } from 'solid-js';

import { Authentication } from '../authentication/authentication';
import { verifyAuthenticationToken } from '../authentication/verify-authentication-token';
import { redirectToOnboardingWhenNotCompleted } from '../onboarding/redirect-to-onboarding';
import { getAuthenticatedMemberQuery, getAuthenticatedMemberUnsafe } from '../utils/authenticated-member';

import { Header } from './header/header';

type LayoutProps = {
  children: JSX.Element;
};

export const Layout: Component<LayoutProps> = (props) => {
  const verifyingAuthenticationToken = verifyAuthenticationToken();
  const memberQuery = getAuthenticatedMemberQuery();
  const member = getAuthenticatedMemberUnsafe();

  redirectToOnboardingWhenNotCompleted();

  return (
    <Show when={!verifyingAuthenticationToken()}>
      <Show when={memberQuery.isFetched}>
        <Show when={member()} fallback={<Authentication />}>
          <Header />
          <main class="col mx-auto w-full max-w-7xl flex-1 px-4 pb-4">{props.children}</main>
        </Show>
      </Show>
    </Show>
  );
};
