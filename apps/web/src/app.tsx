import { Route, Router, Routes } from '@solidjs/router';
import { JSX, ErrorBoundary as SolidErrorBoundary, lazy, type Component, onMount } from 'solid-js';

import { BackLink } from './components/back-link';
import { Feature, FeatureFlag } from './components/feature-flag';
import { SuspenseLoader } from './components/loader';
import { ActivitiesPage, AssetsPage, EventsPage, MiscPage } from './home/home.page';
import { MatomoScript } from './infrastructure/analytics/matomo-script';
import { TrackPageView } from './infrastructure/analytics/track-page-view';
import { NotificationsContainer } from './infrastructure/notifications/toast-notifications.adapter';
import { IntlProvider } from './intl';
import { Translate } from './intl/translate';
import { Layout } from './layout/layout';
import { AddressPage } from './profile/address.page';
import { ProfileEditionPage } from './profile/profile-edition.page';
import { ProfileLayout } from './profile/profile.layout';
import { SettingsPage } from './profile/settings.page';
import { SignOutPage } from './profile/sign-out.page';
import { routes } from './routes';
import { AppStoreProvider } from './store/app-store';
import { ErrorTestPage } from './utils/error-test.page';

const HomePage = lazyImport(() => import('./home/home.page'), 'HomePage');
const RequestsPage = lazyImport(() => import('./requests/requests.page'), 'RequestsPage');
const RequestPage = lazyImport(() => import('./requests/request/request.page'), 'RequestPage');
// prettier-ignore
const CreateRequestPage = lazyImport(() => import('./requests/create-request/create-request.page'), 'CreateRequestPage');
const OnboardingPage = lazyImport(() => import('./onboarding/onboarding.page'), 'OnboardingPage');
const MembersPage = lazyImport(() => import('./members/members.page'), 'MembersPage');
const MemberPage = lazyImport(() => import('./members/member.page'), 'MemberPage');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function lazyImport(module: () => Promise<any>, name: string) {
  return lazy(() => module().then((module) => ({ default: module[name] })));
}

export const App: Component = () => {
  onMount(() => {
    if (localStorage.getItem('dark') === null) {
      localStorage.setItem('dark', String(window.matchMedia('(prefers-color-scheme: dark)').matches));
    }

    if (localStorage.getItem('dark') === 'true') {
      document.documentElement.classList.add('dark');
    }
  });

  return (
    <SolidErrorBoundary
      fallback={(error) => {
        console.error(error);
        return <>{error?.message ?? 'Unknown error'}</>;
      }}
    >
      <Providers>
        <Layout>
          <Routing />
        </Layout>
      </Providers>
    </SolidErrorBoundary>
  );
};

type ProvidersProps = {
  children: JSX.Element;
};

const Providers: Component<ProvidersProps> = (props) => {
  return (
    <IntlProvider>
      <Router>
        <AppStoreProvider>
          <MatomoScript />
          <TrackPageView />
          <NotificationsContainer />
          <SuspenseLoader>{props.children}</SuspenseLoader>
        </AppStoreProvider>
      </Router>
    </IntlProvider>
  );
};

const Routing: Component = () => {
  return (
    <Routes>
      <Route path="/" component={HomePage} />
      <Route path="/onboarding" component={OnboardingPage} />
      <Route path="/members" component={MembersPage} />
      <Route path="/members/:memberId" component={MemberPage} />

      <FeatureFlag
        feature={Feature.requests}
        fallback={<Route path="/requests" component={RequestsPlaceholderPage} />}
      >
        <Route path="/requests" component={RequestsPage} />
      </FeatureFlag>

      <Route path="/requests/create" component={CreateRequestPage} />
      <Route path="/requests/:requestId" component={RequestPage} />
      <Route path="/events" component={EventsPage} />
      <Route path="/activities" component={ActivitiesPage} />
      <Route path="/assets" component={AssetsPage} />
      <Route path="/misc" component={MiscPage} />
      <Route path="/profile" component={ProfileLayout}>
        <Route path="/" component={ProfileEditionPage} />
        <Route path="/address" component={AddressPage} />
        <Route path="/settings" component={SettingsPage} />
        <Route path="/sign-out" component={SignOutPage} />
      </Route>
      <Route path="/__error" component={ErrorTestPage} />
    </Routes>
  );
};

export function RequestsPlaceholderPage() {
  return (
    <div>
      <BackLink href={routes.home} />

      <h1>
        <Translate id="requests.title" />
      </h1>

      <p class="font-semibold">
        <Translate id="requests.sentence1" />
      </p>

      <p>
        <Translate id="requests.sentence2" />
      </p>
    </div>
  );
}
