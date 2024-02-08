import { Component, JSX, Show, lazy } from 'solid-js';

import { authenticatedMember } from '../app-context';
import { redirectToOnboardingWhenNotCompleted } from '../onboarding/redirect-to-onboarding';

import { ErrorBoundary } from './error-boundary';
import { Header, HeaderMember } from './header/header';

const AuthenticationPage = lazy(() => import('../modules/authentication/authentication.page'));

type LayoutProps = {
  children: JSX.Element;
};

export const Layout: Component<LayoutProps> = (props) => {
  redirectToOnboardingWhenNotCompleted();

  return (
    <>
      <Show when={authenticatedMember()} fallback={<AuthenticationPage />}>
        <Header>
          <HeaderMember />
        </Header>

        <ErrorBoundary>
          <main class="col mx-auto w-full max-w-7xl flex-1 px-4 pb-4">{props.children}</main>
        </ErrorBoundary>
      </Show>
    </>
  );
};
