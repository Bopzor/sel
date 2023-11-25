import { Route, Router, Routes } from '@solidjs/router';
import { QueryClient, QueryClientProvider } from '@tanstack/solid-query';
import { JSX, Show, createResource, createSignal, lazy, type Component } from 'solid-js';

import { MatomoScript } from './infrastructure/analytics/matomo-script';
import { TrackPageView } from './infrastructure/analytics/track-page-view';
import { IntlProvider } from './intl';
import { getTranslations } from './intl/get-translations';
import { Language } from './intl/types';
import { Layout } from './layout/layout';
import { AddressPage } from './profile/address.page';
import { NotificationsPage } from './profile/notifications.page';
import { ProfileEditionPage } from './profile/profile-edition.page';
import { ProfileLayout } from './profile/profile.layout';
import { SignOutPage } from './profile/sign-out.page';

const HomePage = lazyImport(() => import('./home/home.page'), 'HomePage');
const OnboardingPage = lazyImport(() => import('./onboarding/onboarding.page'), 'OnboardingPage');
const MembersPage = lazyImport(() => import('./members/members.page'), 'MembersPage');
const MemberPage = lazyImport(() => import('./members/member.page'), 'MemberPage');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function lazyImport(module: () => Promise<any>, name: string) {
  return lazy(() => module().then((module) => ({ default: module[name] })));
}

export const App: Component = () => {
  return (
    <Providers>
      <Layout>
        <Routes>
          <Route path="/" component={HomePage} />
          <Route path="/onboarding" component={OnboardingPage} />
          <Route path="/members" component={MembersPage} />
          <Route path="/members/:memberId" component={MemberPage} />
          <Route path="/profile" component={ProfileLayout}>
            <Route path="/" component={ProfileEditionPage} />
            <Route path="/address" component={AddressPage} />
            <Route path="/notifications" component={NotificationsPage} />
            <Route path="/sign-out" component={SignOutPage} />
          </Route>
        </Routes>
      </Layout>
    </Providers>
  );
};

const queryClient = new QueryClient();

type ProvidersProps = {
  children: JSX.Element;
};

const Providers: Component<ProvidersProps> = (props) => {
  const [language] = createSignal<Language>('fr');
  const [translations] = createResource(language, getTranslations);

  return (
    <Show when={translations()}>
      {(translations) => (
        <IntlProvider locale={language()} messages={translations()}>
          <QueryClientProvider client={queryClient}>
            <Router>
              {props.children}
              <MatomoScript />
              <TrackPageView />
            </Router>
          </QueryClientProvider>
        </IntlProvider>
      )}
    </Show>
  );
};
