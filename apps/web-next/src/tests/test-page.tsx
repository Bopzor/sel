import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { createConfig } from '@sel/shared';
import { QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { createMemoryRouter, RouterProvider, type RouteObject } from 'react-router';

import { queries } from 'src/app/queries';
import { queryClient } from 'src/app/query-client';

export function renderTestPage(path: string, routes: RouteObject[]) {
  const router = createTestRouter(path, routes);

  queryClient.setQueryData(queries.config().queryKey, createConfig());

  render(
    <I18nProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </I18nProvider>,
  );

  return router;
}

const HydrateFallback = () => null;

function createTestRouter(path: string, routes: RouteObject[]) {
  return createMemoryRouter(
    routes.map((route) => ({
      HydrateFallback,
      ...route,
    })),
    { initialEntries: [path] },
  );
}
