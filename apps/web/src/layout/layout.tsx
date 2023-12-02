import { Component, JSX, Show } from 'solid-js';

import { Authentication } from '../authentication/authentication';
import { VerifyAuthenticationToken } from '../authentication/verify-authentication-token';
import { Async } from '../components/async';
import { redirectToOnboardingWhenNotCompleted } from '../onboarding/redirect-to-onboarding';
import { getAuthenticatedMemberQuery } from '../utils/authenticated-member';

import { Header, HeaderMember } from './header/header';

type LayoutProps = {
  children: JSX.Element;
};

export const Layout: Component<LayoutProps> = (props) => {
  const memberQuery = getAuthenticatedMemberQuery();

  redirectToOnboardingWhenNotCompleted();

  return (
    <Async query={memberQuery}>
      {(member) => (
        <VerifyAuthenticationToken>
          <Show when={member} fallback={<Authentication />}>
            <Header>
              <HeaderMember />
            </Header>
            <main class="col mx-auto w-full max-w-7xl flex-1 px-4 pb-4">{props.children}</main>
          </Show>
        </VerifyAuthenticationToken>
      )}
    </Async>
  );
};
