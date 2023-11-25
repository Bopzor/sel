import { AuthenticatedMember } from '@sel/shared';
import { assert } from '@sel/utils';
import { Accessor } from 'solid-js';

import { body } from '../fetcher';

import { query } from './query';

export function getAuthenticatedMemberUnsafe() {
  return query((fetcher) => ({
    key: ['authenticatedMember'],
    async query() {
      const result = await body(fetcher.get<AuthenticatedMember>('/api/session/member'));
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

export function getAuthenticatedMember(): Accessor<AuthenticatedMember> {
  const [getMember] = getAuthenticatedMemberUnsafe();

  return () => {
    const member = getMember();

    assert(member !== null, 'getAuthenticatedMember: member is null');

    return member;
  };
}
