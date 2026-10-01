import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';

import './index.css';
import { applyInstanceColors } from './instance';
import { Layout } from './layout/layout';
import { NavigationPage } from './pages/navigation';
import { PlaceholderPage } from './pages/placeholder';
import { navigation, routes } from './routes';

applyInstanceColors();

const router = createBrowserRouter([
  {
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
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
