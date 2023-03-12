import { FRONT_TOKENS } from '../../../../app/front-tokens';
import { ssr } from '../../../../app/prefetch-query';

export const onBeforeRender = ssr(async (prefetch, { routeParams }) => {
  const memberId = routeParams.memberId;

  await prefetch(FRONT_TOKENS.membersService, 'getMember', memberId);
});
