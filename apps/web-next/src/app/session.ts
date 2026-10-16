import * as Sentry from '@sentry/react';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { redirect, useNavigate, type MiddlewareFunction } from 'react-router';

import { api, ApiError } from './api';
import { setMatomoUser } from './matomo';
import { unsubscribePushNotification } from './push-notifications';
import { queries } from './queries';
import { queryClient } from './query-client';
import { routes } from './routes';

export const requireSession: MiddlewareFunction = async ({ request }) => {
  if (!(await hasSession())) {
    const { pathname, search } = new URL(request.url);
    // The base url ends with a slash, which the path keeps.
    const next = pathname.slice(import.meta.env.BASE_URL.length - 1) + search;

    throw redirect(routes.authentication(next === routes.home() ? undefined : next));
  }
};

export const requireNoSession: MiddlewareFunction = async ({ request }) => {
  if (await hasSession()) {
    throw redirect(nextUrl(new URL(request.url).searchParams));
  }
};

// Only a page of the app, so that a link can't lead the member to another site.
export function nextUrl(searchParams: URLSearchParams) {
  const next = searchParams.get('next');

  if (next !== null) {
    const url = new URL(next, window.location.origin);

    if (url.origin === window.location.origin) {
      return url.pathname + url.search + url.hash;
    }
  }

  return routes.home();
}

async function hasSession() {
  try {
    const member = await queryClient.query({ ...queries.session(), staleTime: 'static' });

    Sentry.setUser({ id: member.id });
    setMatomoUser(member.id);

    return true;
  } catch (error) {
    if (ApiError.is(error, 401)) {
      return false;
    }

    throw error;
  }
}

export function useSession() {
  return useSuspenseQuery(queries.session()).data;
}

export function useSignOut() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationFn: () => api('DELETE', '/session'),
    onSuccess: async () => {
      // Not awaited: navigator.serviceWorker.ready never resolves when the service worker could not be registered.
      // oxlint-disable-next-line no-console
      unsubscribePushNotification().catch(console.error);

      // Before navigating: the authentication page would find the member's session in the cache.
      queryClient.clear();
      Sentry.setUser(null);
      setMatomoUser(null);

      await navigate(routes.authentication());
    },
  });

  return () => {
    mutate();
  };
}
