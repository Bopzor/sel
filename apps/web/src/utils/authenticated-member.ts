import { AuthenticatedMember } from '@sel/shared';
import { createQuery } from '@tanstack/solid-query';

import { container } from '../infrastructure/container';
import { TOKENS } from '../tokens';

function getAuthenticatedMemberQuery() {
  const fetcher = container.resolve(TOKENS.fetcher);

  return createQuery(() => ({
    queryKey: ['getAuthenticatedMember'],
    queryFn: () => fetcher.get<AuthenticatedMember>('/session/member').body(),
    staleTime: 1000 * 60 * 5,
  }));
}

export function getAuthenticatedMember() {
  const query = getAuthenticatedMemberQuery();
  return () => query.data;
}

export function getIsAuthenticatedMember() {
  const authenticatedMember = getAuthenticatedMember();
  return (member: { id: string }) => authenticatedMember()?.id === member.id;
}

export function getRefetchAuthenticatedMember() {
  return getAuthenticatedMemberQuery().refetch;
}
