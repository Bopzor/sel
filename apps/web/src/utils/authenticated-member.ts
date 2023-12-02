import { AuthenticatedMember } from '@sel/shared';
import { assert } from '@sel/utils';
import { Accessor, createEffect, createSignal } from 'solid-js';
import { unwrap } from 'solid-js/store';

import { query } from './query';

export function getAuthenticatedMemberQuery() {
  return query((fetcher) => ({
    key: ['authenticatedMember'],
    refetchOnMount: false,
    async query() {
      const result = await fetcher.get<AuthenticatedMember>('/api/session/member').body();
      return result ?? null;
    },
    onFetchError(error) {
      if (error.status === 401) {
        return null;
      } else {
        throw error;
      }
    },
  }));
}

export function getAuthenticatedMemberUnsafe(): Accessor<AuthenticatedMember | null | undefined> {
  const query = getAuthenticatedMemberQuery();
  const [data, setData] = createSignal(query.data);

  createEffect(() => {
    setData(unwrap(query.data));
  });

  return data;
}

export function getAuthenticatedMember(): Accessor<AuthenticatedMember> {
  const getter = getAuthenticatedMemberUnsafe();

  return () => {
    const member = getter();

    assert(member !== null, 'getAuthenticatedMember: member is null');
    assert(member !== undefined, 'getAuthenticatedMember: member is undefined');

    return member;
  };
}
