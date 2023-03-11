import { PageContextServer } from '../../../../renderer/types';

export const onBeforeRender = async ({ FRONT_TOKENS, prefetchQuery }: PageContextServer) => {
  await prefetchQuery(FRONT_TOKENS.requestsService, 'listRequests', '');
};
