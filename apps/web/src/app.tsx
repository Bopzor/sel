import { JSX, ErrorBoundary as SolidErrorBoundary, onMount } from 'solid-js';

import { SuspenseLoader } from './components/loader';
import { MatomoScript } from './infrastructure/analytics/matomo-script';
import { TrackPageView } from './infrastructure/analytics/track-page-view';
import { NotificationsContainer } from './infrastructure/notifications/toast-notifications.adapter';
import { IntlProvider } from './intl';
import { Layout } from './layout/layout';
import { AppStoreProvider } from './store/app-store';

type AppProps = {
  children?: JSX.Element;
};

export function App(props: AppProps) {
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
      <IntlProvider>
        <AppStoreProvider>
          <MatomoScript />
          <TrackPageView />
          <NotificationsContainer />
          <SuspenseLoader>
            <Layout>{props.children}</Layout>
          </SuspenseLoader>
        </AppStoreProvider>
      </IntlProvider>
    </SolidErrorBoundary>
  );
}
