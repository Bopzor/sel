import { AuthenticatedMember } from '@sel/shared';
import { defined } from '@sel/utils';
import { Accessor } from 'solid-js';

import { body } from '../fetcher';

import { query } from './query';

export function getAuthenticatedMemberUnsafe() {
  return query((fetcher) => ({
    key: ['authenticatedMember'],
    query: () => body(fetcher.get<AuthenticatedMember>('/api/session/member')),
    onFetchError(error) {
      if (error.status === 401) {
        return undefined;
      } else {
        throw error;
      }
    },
  }));
}

export function getAuthenticatedMember(): Accessor<AuthenticatedMember> {
  const [member] = getAuthenticatedMemberUnsafe();

  return () => {
    return defined(member());
  };
}
