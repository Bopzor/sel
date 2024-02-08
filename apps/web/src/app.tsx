import { JSX, ErrorBoundary as SolidErrorBoundary, createEffect, onMount } from 'solid-js';

import { AppContextProvider, authenticatedMember } from './app-context';
import { SuspenseLoader } from './components/loader';
import { MatomoScript } from './infrastructure/analytics/matomo-script';
import { TrackPageView } from './infrastructure/analytics/track-page-view';
import { container } from './infrastructure/container';
import { NotificationsContainer } from './infrastructure/notifications/toast-notifications.adapter';
import { IntlProvider } from './intl';
import { Layout } from './layout/layout';
import { AppStoreProvider } from './store/app-store';
import { TOKENS } from './tokens';
import { detectDevice } from './utils/detect-device';

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
        // eslint-disable-next-line no-console
        console.error(error);
        return <>{error?.message ?? 'Unknown error'}</>;
      }}
    >
      <IntlProvider>
        <MatomoScript />
        <TrackPageView />
        <NotificationsContainer />
        <SuspenseLoader>
          <AppContextProvider>
            <AppStoreProvider>
              <RegisterDeviceSubscription />
              <Layout>{props.children}</Layout>
            </AppStoreProvider>
          </AppContextProvider>
        </SuspenseLoader>
      </IntlProvider>
    </SolidErrorBoundary>
  );
}

function RegisterDeviceSubscription() {
  createEffect(() => {
    if (authenticatedMember()) {
      // eslint-disable-next-line no-console
      void registerDeviceSubscription().catch(console.error);
    }
  });

  return null;
}

async function registerDeviceSubscription() {
  const fetcher = container.resolve(TOKENS.fetcher);

  if (!navigator.serviceWorker) {
    return;
  }

  const registration = await navigator.serviceWorker.ready;
  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: import.meta.env.VITE_WEB_PUSH_PUBLIC_KEY,
    });
  }

  await fetcher.post('/api/session/notifications/register-device', {
    deviceType: detectDevice(),
    subscription,
  });
}
