import { Route, Router, Routes } from '@solidjs/router';
import { JSX, ErrorBoundary as SolidErrorBoundary, lazy, type Component } from 'solid-js';

import { BackLink } from './components/back-link';
import { SuspenseLoader } from './components/loader';
import { ActivitiesPage, AssetsPage, EventsPage, MiscPage } from './home/home.page';
import { MatomoScript } from './infrastructure/analytics/matomo-script';
import { TrackPageView } from './infrastructure/analytics/track-page-view';
import { NotificationsContainer } from './infrastructure/notifications/toast-notifications.adapter';
import { IntlProvider } from './intl';
import { Translate } from './intl/translate';
import { Layout } from './layout/layout';
import { AddressPage } from './profile/address.page';
import { NotificationsPage } from './profile/notifications.page';
import { ProfileEditionPage } from './profile/profile-edition.page';
import { ProfileLayout } from './profile/profile.layout';
import { SignOutPage } from './profile/sign-out.page';
import { RequestPage } from './requests/request/request.page';
import { routes } from './routes';
import { AppStoreProvider } from './store/app-store';
import { ErrorTestPage } from './utils/error-test.page';

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
      <Route path="/requests" component={RequestsPage} />
      <Route path="/requests/:requestId" component={RequestPage} />
      <Route path="/events" component={EventsPage} />
      <Route path="/activities" component={ActivitiesPage} />
      <Route path="/assets" component={AssetsPage} />
      <Route path="/misc" component={MiscPage} />
      <Route path="/profile" component={ProfileLayout}>
        <Route path="/" component={ProfileEditionPage} />
        <Route path="/address" component={AddressPage} />
        <Route path="/notifications" component={NotificationsPage} />
        <Route path="/sign-out" component={SignOutPage} />
      </Route>
      <Route path="/__error" component={ErrorTestPage} />
    </Routes>
  );
};

export function RequestsPage() {
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
