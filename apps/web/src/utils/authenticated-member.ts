import { AuthenticatedMember } from '@sel/shared';
import { assert } from '@sel/utils';

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

export function getAuthenticatedMemberUnsafe(): AuthenticatedMember | null | undefined {
  return getAuthenticatedMemberQuery().data;
}

export function getAuthenticatedMember(): AuthenticatedMember {
  const member = getAuthenticatedMemberUnsafe();

  assert(member !== null, 'getAuthenticatedMember: member is null');
  assert(member !== undefined, 'getAuthenticatedMember: member is undefined');

  return member;
}
