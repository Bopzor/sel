import { i18n } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { I18nProvider } from '@lingui/react';
import { wrapCreateBrowserRouter } from '@sentry/react/react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider, type RouteObject } from 'react-router';

import { watchColorScheme } from './app/color-scheme';
import { loadConfig } from './app/config';
import { activateLocale, getLocale } from './app/locale';
import { getPushPermission, registerDevice } from './app/push-notifications';
import { queries } from './app/queries';
import { queryClient } from './app/query-client';
import { navigation, routes } from './app/routes';
import { captureError, initSentry } from './app/sentry';
import { requireNoSession, requireSession } from './app/session';
import { applyTheme } from './app/theme';
import { Toaster } from './components/toaster';
import './index.css';
import { Layout } from './layout/layout';
import { AuthenticationPage } from './pages/authentication/authentication';
import { NotFoundPage, PageErrorBoundary, RootErrorBoundary } from './pages/error-page';
import { CreateEventPage } from './pages/events/create/create-event-page';
import { EventPage } from './pages/events/details/event-page';
import { EditEventPage } from './pages/events/edit/edit-event-page';
import { EventsPage } from './pages/events/list/events-page';
import { NavigationPage } from './pages/navigation';
import { PlaceholderPage } from './pages/placeholder';
import { ProfilePage } from './pages/profile/profile-page';
import { CreateRequestPage } from './pages/requests/create/create-request-page';
import { RequestPage } from './pages/requests/details/request-page';
import { EditRequestPage } from './pages/requests/edit/edit-request-page';
import { RequestsPage } from './pages/requests/list/requests-page';
import { SettingsPage } from './pages/settings/settings-page';

initSentry();
activateLocale(getLocale());
watchColorScheme();

// Middlewares run on each navigation: these flags make them run once per page load.
let initialized = false;
let sessionInitialized = false;

async function initialize() {
  if (initialized) {
    return;
  }

  const config = await loadConfig();

  applyTheme(config.theme);
  initialized = true;
}

function initializeSession() {
  if (sessionInitialized) {
    return;
  }

  const member = queryClient.getQueryData(queries.session().queryKey);

  // Keeps the registration up to date when the browser renews it. Not awaited: navigator.serviceWorker.ready never
  // resolves when the service worker could not be registered.
  if (member?.notificationDelivery.push && getPushPermission() === 'granted') {
    // oxlint-disable-next-line no-console
    registerDevice().catch(console.error);
  }

  sessionInitialized = true;
}

const authenticatedRoutes: RouteObject[] = [
  {
    path: routes.home(),
    element: <PlaceholderPage title={navigation.main.home.label} />,
  },
  {
    path: routes.requests(),
    Component: RequestsPage,
  },
  {
    path: routes.createRequest(),
    Component: CreateRequestPage,
  },
  {
    path: routes.request(':requestId'),
    Component: RequestPage,
  },
  {
    path: routes.editRequest(':requestId'),
    Component: EditRequestPage,
  },
  {
    path: routes.events(),
    Component: EventsPage,
  },
  {
    path: routes.createEvent(),
    Component: CreateEventPage,
  },
  {
    path: routes.event(':eventId'),
    Component: EventPage,
  },
  {
    path: routes.editEvent(':eventId'),
    Component: EditEventPage,
  },
  {
    path: routes.information(),
    element: <PlaceholderPage title={navigation.community.information.label} />,
  },
  {
    path: routes.interests(),
    element: <PlaceholderPage title={navigation.community.interests.label} />,
  },
  {
    path: routes.members(),
    element: <PlaceholderPage title={navigation.community.members.label} />,
  },
  {
    path: routes.member(':memberId'),
    element: <PlaceholderPage title={msg`Member`} />,
  },
  {
    path: routes.profile(),
    Component: ProfilePage,
  },
  {
    path: routes.settings(),
    Component: SettingsPage,
  },
  {
    path: routes.navigation(),
    Component: NavigationPage,
  },
  {
    path: '*',
    Component: NotFoundPage,
  },
];

function HydrateFallback() {
  return null;
}

const router = wrapCreateBrowserRouter(createBrowserRouter)([
  {
    middleware: [initialize],
    HydrateFallback,
    ErrorBoundary: RootErrorBoundary,
    children: [
      {
        path: routes.authentication(),
        middleware: [requireNoSession],
        Component: AuthenticationPage,
      },
      {
        middleware: [requireSession, initializeSession],
        Component: Layout,
        children: [
          {
            ErrorBoundary: PageErrorBoundary,
            children: authenticatedRoutes,
          },
        ],
      },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} onError={(error, { errorInfo }) => captureError(error, errorInfo)} />
        <Toaster />
        <ReactQueryDevtools />
      </QueryClientProvider>
    </I18nProvider>
  </StrictMode>,
);
