import { FRONT_TOKENS } from '../../../../app/front-tokens';
import { PageContextServer } from '../../../../renderer/types';

export const onBeforeRender = async ({ prefetchQuery }: PageContextServer) => {
  await prefetchQuery(FRONT_TOKENS.requestsService, 'listRequests', '');
};
