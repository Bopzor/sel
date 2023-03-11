import { Token } from 'brandi';
import { QueryClient } from 'react-query';

import { Methods } from '../utils/methods';

import { container } from './front-tokens';

export type PrefetchQuery = <
  Service,
  ServiceMethods extends Methods<Service>,
  Method extends keyof ServiceMethods
>(
  token: Token<Service>,
  method: Method,
  ...params: Parameters<ServiceMethods[Method]>
) => Promise<void>;

export const prefetchQuery =
  (queryClient: QueryClient): PrefetchQuery =>
  async (token, method, ...params) => {
    const service = container.get(token) as {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [method in typeof method]: (...args: typeof params) => any;
    };

    await queryClient.prefetchQuery([token, method, params], () => service[method](...params));
  };
