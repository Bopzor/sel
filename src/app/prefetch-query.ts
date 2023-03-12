import { Token } from 'brandi';
import { QueryClient } from 'react-query';

import { AuthenticationService } from '../modules/authentication/authentication.service';
import { MembersService } from '../modules/members/members.service';
import { RequestsService } from '../modules/requests/requests.service';
import { PageContextServer } from '../renderer/types';
import { Methods } from '../utils/methods';

import { FRONT_TOKENS } from './front-tokens';
import { SSRFetchHttpClient } from './http-client';

type PrefetchQuery = <Service, ServiceMethods extends Methods<Service>, Method extends keyof ServiceMethods>(
  token: Token<Service>,
  method: Method,
  ...params: Parameters<ServiceMethods[Method]>
) => Promise<void>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const prefetchQuery = (queryClient: QueryClient, map: Map<Token, any>): PrefetchQuery => {
  return async (token, method, ...params) => {
    const service = map.get(token);

    await queryClient.prefetchQuery([token, method, params], () => service[method](...params));
  };
};

export const createPrefetchQuery = (pageContext: PageContextServer) => {
  const httpClient = new SSRFetchHttpClient(pageContext.cookie);

  const map = new Map<Token, unknown>([
    [FRONT_TOKENS.authenticationService, new AuthenticationService(httpClient)],
    [FRONT_TOKENS.requestsService, new RequestsService(httpClient)],
    [FRONT_TOKENS.membersService, new MembersService(httpClient)],
  ]);

  return prefetchQuery(pageContext.queryClient, map);
};

export const ssr = (cb: (prefetch: PrefetchQuery, pageContext: PageContextServer) => Promise<void>) => {
  return async (pageContext: PageContextServer) => {
    await cb(createPrefetchQuery(pageContext), pageContext);
  };
};
