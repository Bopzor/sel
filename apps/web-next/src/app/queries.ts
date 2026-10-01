import type { AuthenticatedMember, Config } from '@sel/shared';
import { queryOptions } from '@tanstack/react-query';

import { api } from './api';

export const queries = {
  config: () => {
    return queryOptions({
      staleTime: 'static',
      queryKey: ['config'],
      queryFn: () => api<Config>('GET', '/config'),
    });
  },

  session: () => {
    return queryOptions({
      queryKey: ['session'],
      queryFn: () => api<AuthenticatedMember>('GET', '/session/member'),
    });
  },
};
