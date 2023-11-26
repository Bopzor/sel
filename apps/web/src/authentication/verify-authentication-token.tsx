import { defined } from '@sel/utils';
import { useQueryClient } from '@tanstack/solid-query';
import { createEffect } from 'solid-js';

import { useSearchParam } from '../infrastructure/router/use-search-param';
import { getAuthenticatedMemberUnsafe } from '../utils/authenticated-member';
import { query } from '../utils/query';

export const verifyAuthenticationToken = () => {
  const [member, memberQuery] = getAuthenticatedMemberUnsafe();
  const [getToken, setToken] = useSearchParam('auth-token');
  const queryClient = useQueryClient();

  const skip = () => {
    if (getToken() === undefined) {
      return true;
    }

    if (memberQuery.isPending || member()) {
      return true;
    }

    return false;
  };

  const [result] = query((fetcher) => ({
    key: ['verifyAuthenticationToken'],
    skip: skip(),
    async query() {
      const token = defined(getToken());
      const params = new URLSearchParams({ token });

      await fetcher.get(`/api/authentication/verify-authentication-token?${params}`);
      await queryClient.invalidateQueries({ queryKey: ['authenticatedMember'] });

      return null;
    },
  }));

  createEffect(() => {
    if (member()) {
      setToken(undefined);
    }
  });

  return result;
};
