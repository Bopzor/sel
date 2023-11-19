import { Route, Router, Routes } from '@solidjs/router';
import { JSX, Show, createResource, createSignal, lazy, type Component } from 'solid-js';

import { MatomoScript } from './infrastructure/analytics/matomo-script';
import { TrackPageView } from './infrastructure/analytics/track-page-view';
import { IntlProvider } from './intl';
import { getTranslations } from './intl/get-translations';
import { Language } from './intl/types';
import { Layout } from './layout/layout';
import { ProfileAddressPage } from './profile/profile-address.page';
import { ProfileEditionPage } from './profile/profile-edition.page';
import { ProfileNotificationsPage } from './profile/profile-notifications.page';
import { ProfileSignOutPage } from './profile/profile-sign-out.page';
import { ProfileLayout } from './profile/profile.layout';

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
          <Route path="/membres" component={MembersPage} />
          <Route path="/membre/:memberId" component={MemberPage} />
          <Route path="/profile" component={ProfileLayout}>
            <Route path="/" component={ProfileEditionPage} />
            <Route path="/address" component={ProfileAddressPage} />
            <Route path="/notifications" component={ProfileNotificationsPage} />
            <Route path="/sign-out" component={ProfileSignOutPage} />
          </Route>
        </Routes>
      </Layout>
    </Providers>
  );
};

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
          <Router>
            {props.children}
            <MatomoScript />
            <TrackPageView />
          </Router>
        </IntlProvider>
      )}
    </Show>
  );
};
