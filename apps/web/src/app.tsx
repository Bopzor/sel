import { QueryClient, QueryClientProvider } from '@tanstack/solid-query';
import { createEffect, JSX, onMount, ErrorBoundary as SolidErrorBoundary } from 'solid-js';
import { useRegisterSW } from 'virtual:pwa-register/solid';

import { SuspenseLoader } from './components/loader';
import { MatomoScript } from './infrastructure/analytics/matomo-script';
import { TrackPageView } from './infrastructure/analytics/track-page-view';
import { container } from './infrastructure/container';
import { NotificationsContainer } from './infrastructure/notifications/toast-notifications.adapter';
import { IntlProvider } from './intl';
import { Layout } from './layout/layout';
import { routes } from './routes';
import { TOKENS } from './tokens';
import { getAuthenticatedMember } from './utils/authenticated-member';

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

  const client = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
      },
    },
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
        <QueryClientProvider client={client}>
          <SuspenseLoader>
            <OnboardingRedirections />
            <Layout>{props.children}</Layout>
          </SuspenseLoader>
        </QueryClientProvider>
      </IntlProvider>
    </SolidErrorBoundary>
  );
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
