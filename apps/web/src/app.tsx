import { Route, Router, Routes } from '@solidjs/router';
import { QueryClient, QueryClientProvider } from '@tanstack/solid-query';
import { SolidQueryDevtools } from '@tanstack/solid-query-devtools';
import {
  JSX,
  Show,
  Suspense,
  createResource,
  createSignal,
  lazy,
  onMount,
  type Component,
  ErrorBoundary as SolidErrorBoundary,
} from 'solid-js';

import { Spinner } from './components/spinner';
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
import { createDebouncedSignal } from './utils/create-debounced-signal';
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
          <Suspense fallback={<Loader />}>
            <Routing />
          </Suspense>
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
            <ErrorBoundary>
              <Router>
                <Suspense fallback={<Loader />}>{props.children}</Suspense>
                <MatomoScript />
                <TrackPageView />
              </Router>
            </ErrorBoundary>
          </QueryClientProvider>
        </IntlProvider>
      )}
    </Show>
  );
};

const Loader: Component = () => {
  const [showLoader, setShowLoader] = createDebouncedSignal(false, 500);

  onMount(() => {
    setShowLoader(true);
  });

  return (
    <Show when={showLoader()}>
      <div class="row mx-auto flex-1 items-center gap-4">
        <Spinner class="h-12 w-12" />
        <p class="typo-h1">
          <Translate id="common.loading" />
        </p>
      </div>
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
