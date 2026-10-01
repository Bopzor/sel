import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';

import { loadConfig } from './app/config';
import { queryClient } from './app/query-client';
import { navigation, routes } from './app/routes';
import { requireNoSession, requireSession } from './app/session';
import { applyTheme } from './app/theme';
import './index.css';
import { Layout } from './layout/layout';
import { messages } from './locales/fr.po';
import { AuthenticationPage } from './pages/authentication';
import { NavigationPage } from './pages/navigation';
import { PlaceholderPage } from './pages/placeholder';

i18n.loadAndActivate({ locale: 'fr', messages });

async function initialize() {
  const config = await loadConfig();

  applyTheme(config.theme);
}

const router = createBrowserRouter([
  {
    middleware: [initialize],
    children: [
      {
        path: routes.authentication(),
        loader: requireNoSession,
        HydrateFallback: () => null,
        Component: AuthenticationPage,
      },
      {
        loader: requireSession,
        HydrateFallback: () => null,
        Component: Layout,
        children: [
          {
            path: routes.home(),
            element: <PlaceholderPage title={navigation.main.home.label} />,
          },
          {
            path: routes.requests(),
            element: <PlaceholderPage title={navigation.exchanges.requests.label} />,
          },
          {
            path: routes.events(),
            element: <PlaceholderPage title={navigation.exchanges.events.label} />,
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
            path: routes.profile(),
            element: <PlaceholderPage title={navigation.account.profile.label} />,
          },
          {
            path: routes.settings(),
            element: <PlaceholderPage title={navigation.account.settings.label} />,
          },
          {
            path: routes.navigation(),
            Component: NavigationPage,
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
        <RouterProvider router={router} />
        <ReactQueryDevtools />
      </QueryClientProvider>
    </I18nProvider>
  </StrictMode>,
);
