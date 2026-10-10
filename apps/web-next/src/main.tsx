import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { wrapCreateBrowserRouter } from '@sentry/react/react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';

import { watchColorScheme } from './app/color-scheme';
import { loadConfig } from './app/config';
import { activateLocale, getLocale } from './app/locale';
import { getPushPermission, registerDevice } from './app/push-notifications';
import { queries } from './app/queries';
import { queryClient } from './app/query-client';
import { routes } from './app/routes';
import { captureError, initSentry } from './app/sentry';
import { requireNoSession, requireSession } from './app/session';
import { applyTheme } from './app/theme';
import { Toaster } from './components/toaster';
import './index.css';
import { Layout } from './layout/layout';
import { AuthenticationPage } from './pages/authentication/authentication';
import { DocumentsPage } from './pages/documents/documents-page';
import { NotFoundPage, PageErrorBoundary, RootErrorBoundary } from './pages/error-page';
import { CreateEventPage } from './pages/events/create/create-event-page';
import { EventPage } from './pages/events/details/event-page';
import { EditEventPage } from './pages/events/edit/edit-event-page';
import { EventsPage } from './pages/events/list/events-page';
import { HomePage } from './pages/home/home-page';
import { CreateInformationPage } from './pages/information/create/create-information-page';
import { InformationDetailsPage } from './pages/information/details/information-details-page';
import { EditInformationPage } from './pages/information/edit/edit-information-page';
import { InformationPage } from './pages/information/list/information-page';
import { MemberPage } from './pages/members/details/member-page';
import { MembersPage } from './pages/members/list/members-page';
import { MembersMapPage } from './pages/members/map/members-map-page';
import { NavigationPage } from './pages/navigation';
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

function PlaceholderPage() {
  return null;
}

const authenticatedRoutes: Record<string, React.ComponentType> = {
  [routes.home()]: HomePage,
  [routes.requests()]: RequestsPage,
  [routes.createRequest()]: CreateRequestPage,
  [routes.request(':requestId')]: RequestPage,
  [routes.editRequest(':requestId')]: EditRequestPage,
  [routes.events()]: EventsPage,
  [routes.createEvent()]: CreateEventPage,
  [routes.event(':eventId')]: EventPage,
  [routes.editEvent(':eventId')]: EditEventPage,
  [routes.information()]: InformationPage,
  [routes.createInformation()]: CreateInformationPage,
  [routes.informationDetails(':informationId')]: InformationDetailsPage,
  [routes.editInformation(':informationId')]: EditInformationPage,
  [routes.interests()]: PlaceholderPage,
  [routes.documents()]: DocumentsPage,
  [routes.members()]: MembersPage,
  [routes.membersMap()]: MembersMapPage,
  [`${routes.member(':memberId')}/:tab?`]: MemberPage,
  [routes.profile()]: ProfilePage,
  [routes.settings()]: SettingsPage,
  [routes.navigation()]: NavigationPage,
  '*': NotFoundPage,
};

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
            children: Object.entries(authenticatedRoutes).map(([path, Component]) => ({ path, Component })),
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
