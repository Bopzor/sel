import { FRONT_TOKENS } from '../../../../app/front-tokens';
import { ssr } from '../../../../app/prefetch-query';

export const onBeforeRender = ssr(async (prefetch, { routeParams }) => {
  const requestId = routeParams.requestId;

  await prefetch(FRONT_TOKENS.requestsService, 'getRequest', requestId);
});
