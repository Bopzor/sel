import { Token } from 'brandi';
import { useInjection } from 'brandi-react';
import { useQuery as useReactQuery } from 'react-query';

import { QueryHandler } from '../../common/cqs/query-handler';

type AsyncResource<Data> = [Data | undefined, { loading: boolean; error: unknown }];

export const useQuery = <Query, Result>(
  token: Token<QueryHandler<Query, Result>>,
  query: Query
): AsyncResource<Result> => {
  const handler = useInjection(token);

  const result = useReactQuery<Result>([handler.constructor.name, query], () => handler.handle(query), {
    retry: false,
  });

  return [
    result.data,
    {
      loading: result.isLoading,
      error: result.error,
    },
  ];
};
