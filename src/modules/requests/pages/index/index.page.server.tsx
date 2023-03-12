import { FRONT_TOKENS } from '../../../../app/front-tokens';
import { ssr } from '../../../../app/prefetch-query';

export const onBeforeRender = ssr(async (prefetch) => {
  await prefetch(FRONT_TOKENS.requestsService, 'listRequests', '');
});
