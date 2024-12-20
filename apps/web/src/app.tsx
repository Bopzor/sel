import { QueryClient, QueryClientProvider as TanstackQueryClientProvider } from '@tanstack/solid-query';
import { createEffect, JSX, onMount, ErrorBoundary as SolidErrorBoundary } from 'solid-js';
import { useRegisterSW } from 'virtual:pwa-register/solid';

import { SuspenseLoader } from './components/loader';
import { MatomoScript } from './infrastructure/analytics/matomo-script';
import { TrackPageView } from './infrastructure/analytics/track-page-view';
import { ApiError } from './infrastructure/api';
import { container } from './infrastructure/container';
import { NotificationsContainer } from './infrastructure/notifications/toast-notifications.adapter';
import { IntlProvider } from './intl';
import { Layout } from './layout/layout';
import { routes } from './routes';
import { TOKENS } from './tokens';
import { getAuthenticatedMember } from './utils/authenticated-member';
import { createErrorHandler } from './utils/create-error-handler';

type AppProps = {
  children?: JSX.Element;
};

export function App(props: AppProps) {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  createEffect(() => {
    if (needRefresh()) {
      void updateServiceWorker(true);
    }
  });

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
        // eslint-disable-next-line no-console
        console.error(error);
        return <>{error?.message ?? 'Unknown error'}</>;
      }}
    >
      <IntlProvider>
        <MatomoScript />
        <TrackPageView />
        <NotificationsContainer />
        <QueryClientProvider>
          <SuspenseLoader>
            <OnboardingRedirections />
            <Layout>{props.children}</Layout>
          </SuspenseLoader>
        </QueryClientProvider>
      </IntlProvider>
    </SolidErrorBoundary>
  );
}

function QueryClientProvider(props: { children: JSX.Element }) {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
        throwOnError: true,
        retry(failureCount: number, error: Error) {
          if (ApiError.isStatus(error, 403) || ApiError.isStatus(error, 404)) {
            return false;
          }

          return failureCount < 3;
        },
      },
      mutations: {
        onError: createErrorHandler(),
      },
    },
  });

  return <TanstackQueryClientProvider client={client}>{props.children}</TanstackQueryClientProvider>;
}

function OnboardingRedirections() {
  const router = container.resolve(TOKENS.router);
  const authenticatedMember = getAuthenticatedMember();

  createEffect(() => {
    const { pathname } = router.location;
    const { onboardingCompleted } = authenticatedMember() ?? {};

    if (onboardingCompleted === false && pathname !== '/onboarding') {
      router.navigate(routes.onboarding);
    }

    if (onboardingCompleted === true && pathname === '/onboarding') {
      router.navigate(routes.home);
    }
  });

  return null;
}
