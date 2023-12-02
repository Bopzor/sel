import { defined } from '@sel/utils';
import { useQueryClient } from '@tanstack/solid-query';
import { JSX, Show, createEffect } from 'solid-js';

import { useSearchParam } from '../infrastructure/router/use-search-param';
import { getAuthenticatedMemberQuery } from '../utils/authenticated-member';
import { query } from '../utils/query';

type VerifyAuthenticationTokenProps = {
  children: JSX.Element;
};

export function VerifyAuthenticationToken(props: VerifyAuthenticationTokenProps) {
  const memberQuery = getAuthenticatedMemberQuery();
  const [getToken, setToken] = useSearchParam('auth-token');

  createEffect(() => {
    if (memberQuery.data) {
      setToken(undefined);
    }
  });

  const skip = () => {
    if (getToken() === undefined) {
      return true;
    }

    if (memberQuery.isPending || memberQuery.data) {
      return true;
    }

    return false;
  };

  const queryClient = useQueryClient();

  const verifyQuery = query((fetcher) => ({
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

  return <Show when={skip() || !verifyQuery.isPending}>{props.children}</Show>;
}
