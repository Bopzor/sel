import { PageContextServer } from '../../../../renderer/types';

export const onBeforeRender = async ({ routeParams, FRONT_TOKENS, prefetchQuery }: PageContextServer) => {
  const requestId = routeParams.requestId;

  await prefetchQuery(FRONT_TOKENS.requestsService, 'getRequest', requestId);
};
