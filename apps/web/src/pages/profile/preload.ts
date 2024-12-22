import { Params } from '@solidjs/router';
import { useQueryClient } from '@tanstack/solid-query';

import { apiQuery } from 'src/application/query';

export function preloadTransactionList({ params }: { params: Params }) {
  const queryClient = useQueryClient();
  void queryClient.prefetchQuery(apiQuery('listTransactions', { query: { memberId: params.memberId } }));
}
