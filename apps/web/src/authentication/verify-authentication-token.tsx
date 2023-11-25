import { onMount } from 'solid-js';

import { useSearchParam } from '../infrastructure/router/use-search-param';
import { mutation } from '../utils/mutation';

export const verifyAuthenticationToken = () => {
  const [getToken, setToken] = useSearchParam('auth-token');

  const [mutate, meta] = mutation((fetcher) => ({
    async mutate(token: string) {
      await fetcher.get(`/api/authentication/verify-authentication-token?${new URLSearchParams({ token })}`);
    },
    onSuccess: () => setToken(undefined),
  }));

  onMount(() => {
    const token = getToken();

    if (token) {
      void mutate(token);
    }
  });

  return () => meta.isPending;
};
