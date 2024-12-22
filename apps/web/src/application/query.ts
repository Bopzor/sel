import { defined } from '@sel/utils';
import { QueryOptions, createQuery, useQueryClient } from '@tanstack/solid-query';

import { api, ApiError } from './api';

type Api = typeof api;

type EndpointResult<Endpoint extends keyof Api> = ReturnType<Api[Endpoint]>;
type EndpointParam<Endpoint extends keyof Api> = Parameters<Api[Endpoint]>[0];

export function apiQuery<Endpoint extends keyof Api>(endpoint: Endpoint, param: EndpointParam<Endpoint>) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  const fn: Function = api[endpoint];

  type Data = EndpointResult<Endpoint>;
  type Key = [Endpoint, EndpointParam<Endpoint>];

  return {
    queryKey: [endpoint, param],
    queryFn: (): Data => fn(param),
  } satisfies Pick<QueryOptions<Data, Error, Data, Key>, 'queryKey' | 'queryFn'>;
}

export function useInvalidateApi() {
  const queryClient = useQueryClient();

  return <Endpoint extends keyof Api>(endpoint: Endpoint, param?: EndpointParam<Endpoint>) => {
    return queryClient.invalidateQueries({ queryKey: param ? [endpoint, param] : [endpoint] });
  };
}

export function queryAuthenticatedMember() {
  return createQuery(() => ({
    ...apiQuery('getAuthenticatedMember', {}),
    retry(count, error) {
      if (ApiError.isStatus(error, 401)) {
        return false;
      }

      return count < 3;
    },
  }));
}

export function getAuthenticatedMember() {
  const query = queryAuthenticatedMember();
  return () => defined(query.data, 'authenticated member is not defined');
}

export function getIsAuthenticatedMember() {
  const member = getAuthenticatedMember();
  return ({ id }: { id: string }) => id === member()?.id;
}
