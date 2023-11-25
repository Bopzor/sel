import { defined } from '@sel/utils';
import { useQueryClient } from '@tanstack/solid-query';

import { useSearchParam } from '../infrastructure/router/use-search-param';
import { query } from '../utils/query';

export const verifyAuthenticationToken = () => {
  const [getToken, setToken] = useSearchParam('auth-token');
  const queryClient = useQueryClient();

  query((fetcher) => ({
    key: ['verifyAuthenticationToken'],
    skip: getToken() === undefined,
    async query() {
      const token = defined(getToken());
      const params = new URLSearchParams({ token });

      await fetcher.get(`/api/authentication/verify-authentication-token?${params}`);
      await queryClient.invalidateQueries({ queryKey: ['authenticatedMember'] });

      setToken(undefined);

      return null;
    },
  }));
};
