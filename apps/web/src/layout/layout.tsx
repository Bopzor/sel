import { Component, JSX, Show } from 'solid-js';

import { Authentication } from '../authentication/authentication';
import { redirectToOnboardingWhenNotCompleted } from '../onboarding/redirect-to-onboarding';
import { getAppState } from '../store/app-store';

import { Header, HeaderMember } from './header/header';

type LayoutProps = {
  children: JSX.Element;
};

export const Layout: Component<LayoutProps> = (props) => {
  const state = getAppState();

  redirectToOnboardingWhenNotCompleted();

  return (
    <Show when={state.authenticatedMember} fallback={<Authentication />}>
      <Header>
        <HeaderMember />
      </Header>
      <main class="col mx-auto w-full max-w-7xl flex-1 px-4 pb-4">{props.children}</main>
    </Show>
  );
};
