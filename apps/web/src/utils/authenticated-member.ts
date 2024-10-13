import { createQuery } from '@tanstack/solid-query';

import { ApiError, useInvalidateApi } from '../infrastructure/api';
import { container } from '../infrastructure/container';
import { TOKENS } from '../tokens';

function getAuthenticatedMemberQuery() {
  const api = container.resolve(TOKENS.api);

  return createQuery(() => ({
    staleTime: 1000 * 60 * 5,
    queryKey: ['getAuthenticatedMember'],
    async queryFn() {
      return api.getAuthenticatedMember({}).catch((error) => {
        if (ApiError.isStatus(error, 401)) {
          return null;
        }

        throw error;
      });
    },
  }));
}

export function getAuthenticatedMember() {
  const query = getAuthenticatedMemberQuery();
  return () => query.data ?? undefined;
}

export function getIsAuthenticatedMember() {
  const authenticatedMember = getAuthenticatedMember();
  return (member: { id: string }) => authenticatedMember()?.id === member.id;
}

export function getRefetchAuthenticatedMember() {
  const invalidate = useInvalidateApi();
  return () => invalidate(['getAuthenticatedMember']);
}
