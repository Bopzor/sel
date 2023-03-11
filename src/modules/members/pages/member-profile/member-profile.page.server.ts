import { FRONT_TOKENS } from '../../../../app/front-tokens';
import { PageContextServer } from '../../../../renderer/types';

export const onBeforeRender = async ({ routeParams, prefetchQuery }: PageContextServer) => {
  const memberId = routeParams.memberId;

  await prefetchQuery(FRONT_TOKENS.membersService, 'getMember', memberId);
};
