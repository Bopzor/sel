import { Route, Router, Routes } from '@solidjs/router';
import { QueryClient, QueryClientProvider } from '@tanstack/solid-query';
import { SolidQueryDevtools } from '@tanstack/solid-query-devtools';
import {
  JSX,
  Show,
  ErrorBoundary as SolidErrorBoundary,
  createResource,
  createSignal,
  lazy,
  type Component,
} from 'solid-js';
import { Toaster } from 'solid-toast';

import { MatomoScript } from './infrastructure/analytics/matomo-script';
import { TrackPageView } from './infrastructure/analytics/track-page-view';
import { IntlProvider } from './intl';
import { getTranslations } from './intl/get-translations';
import { Translate } from './intl/translate';
import { Language } from './intl/types';
import { ErrorBoundary } from './layout/error-boundary';
import { Layout } from './layout/layout';
import { AddressPage } from './profile/address.page';
import { NotificationsPage } from './profile/notifications.page';
import { ProfileEditionPage } from './profile/profile-edition.page';
import { ProfileLayout } from './profile/profile.layout';
import { SignOutPage } from './profile/sign-out.page';
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
    <SolidErrorBoundary fallback={<Translate id="common.error.unknownErrorMessage" />}>
      <Providers>
        <Layout>
          <Routing />
        </Layout>
      </Providers>
    </SolidErrorBoundary>
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
            <SolidQueryDevtools />
            <Router>
              <ErrorBoundary>
                <AppStoreProvider>{props.children}</AppStoreProvider>
                <Toaster toastOptions={{ duration: 5 * 1000, className: '!max-w-xl' }} />
                <MatomoScript />
                <TrackPageView />
              </ErrorBoundary>
            </Router>
          </QueryClientProvider>
        </IntlProvider>
      )}
    </Show>
  );
};

const Routing: Component = () => {
  return (
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
      <Route path="/__error" component={ErrorTestPage} />
    </Routes>
  );
};
