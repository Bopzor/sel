import { FRONT_TOKENS } from '../../../../app/front-tokens';
import { PageContextServer } from '../../../../renderer/types';

export const onBeforeRender = async ({ routeParams, prefetchQuery }: PageContextServer) => {
  const requestId = routeParams.requestId;

  await prefetchQuery(FRONT_TOKENS.requestsService, 'getRequest', requestId);
};
