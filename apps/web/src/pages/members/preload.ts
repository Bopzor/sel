import { Params } from '@solidjs/router';
import { useQueryClient } from '@tanstack/solid-query';

import { apiQuery } from 'src/application/query';

export function preloadMemberList() {
  const queryClient = useQueryClient();
  void queryClient.prefetchQuery(apiQuery('listMembers', { query: {} }));
}

export function preloadMember({ params }: { params: Params }) {
  const queryClient = useQueryClient();
  void queryClient.prefetchQuery(apiQuery('getMember', { path: { memberId: params.memberId! } }));
}
