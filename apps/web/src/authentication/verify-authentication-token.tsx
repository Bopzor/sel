import { createMutation } from '@tanstack/solid-query';
import { onMount } from 'solid-js';

import { container } from '../infrastructure/container';
import { useSearchParam } from '../infrastructure/router/use-search-param';
import { TOKENS } from '../tokens';

export const verifyAuthenticationToken = () => {
  const [getToken, setToken] = useSearchParam('auth-token');

  const fetcher = container.resolve(TOKENS.fetcher);
  const mutation = createMutation(() => ({
    mutationFn: (token: string) =>
      fetcher.get(`/api/authentication/verify-authentication-token?${new URLSearchParams({ token })}`),
    onSuccess: () => setToken(undefined),
  }));

  onMount(() => {
    const token = getToken();

    if (token) {
      void mutation.mutate(token);
    }
  });

  return () => mutation.isPending;
};
