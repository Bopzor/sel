import { AuthenticatedMember } from '@sel/shared';
import { defined } from '@sel/utils';
import { createQuery } from '@tanstack/solid-query';
import { Accessor } from 'solid-js';

import { FetchResult, body } from '../fetcher';
import { container } from '../infrastructure/container';
import { TOKENS } from '../tokens';

export function getAuthenticatedMemberQuery() {
  const fetcher = container.resolve(TOKENS.fetcher);

  const query = createQuery(() => ({
    queryKey: ['authenticatedMember'],
    async queryFn() {
      try {
        return await body(fetcher.get<AuthenticatedMember>('/api/session/member'));
      } catch (error) {
        if (FetchResult.is(error) && error.status === 401) {
          return undefined;
        }

        throw error;
      }
    },
  }));

  return query;
}

export function getAuthenticatedMemberUnsafe(): Accessor<AuthenticatedMember | undefined> {
  const query = getAuthenticatedMemberQuery();

  if (FetchResult.is(query.error) && query.error.status === 401) {
    return () => undefined;
  }

  return () => query.data;
}

export function getAuthenticatedMember(): Accessor<AuthenticatedMember> {
  const unsafe = getAuthenticatedMemberUnsafe();
  return () => defined(unsafe());
}
