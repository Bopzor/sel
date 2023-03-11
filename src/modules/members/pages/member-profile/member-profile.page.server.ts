import { PageContextServer } from '../../../../renderer/types';

export const onBeforeRender = async ({ routeParams, FRONT_TOKENS, prefetchQuery }: PageContextServer) => {
  const memberId = routeParams.memberId;

  await prefetchQuery(FRONT_TOKENS.membersService, 'getMember', memberId);
};
