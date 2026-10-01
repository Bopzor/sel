import type { AuthenticatedMember } from '@sel/shared';
import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { redirect, useNavigate, type LoaderFunctionArgs } from 'react-router';

import { api, ApiError } from './api';
import { queryClient } from './query-client';
import { routes } from './routes';

export const sessionQuery = queryOptions({
  queryKey: ['session'],
  queryFn: () => api<AuthenticatedMember>('GET', '/session/member'),
});

export async function requireSession({ request }: LoaderFunctionArgs) {
  if (await hasSession()) {
    return null;
  }

  const { pathname, search } = new URL(request.url);
  const next = pathname + search;

  return redirect(routes.authentication(next === routes.home() ? undefined : next));
}

export async function requireNoSession({ request }: LoaderFunctionArgs) {
  if (await hasSession()) {
    return redirect(nextUrl(new URL(request.url).searchParams));
  }

  return null;
}

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
    await queryClient.query({ ...sessionQuery, staleTime: 'static' });
    return true;
  } catch (error) {
    if (ApiError.is(error, 401)) {
      return false;
    }

    throw error;
  }
}

export function useSignOut() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationFn: () => api('DELETE', '/session'),
    onSuccess: async () => {
      // Before navigating: the authentication page would find the member's session in the cache.
      queryClient.clear();
      await navigate(routes.authentication());
    },
  });

  return () => {
    mutate();
  };
}
