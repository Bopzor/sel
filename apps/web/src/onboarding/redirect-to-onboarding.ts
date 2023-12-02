import { createEffect } from 'solid-js';

import { container } from '../infrastructure/container';
import { routes } from '../routes';
import { getAppState } from '../store/app-store';
import { TOKENS } from '../tokens';

export function redirectToOnboardingWhenNotCompleted() {
  const state = getAppState();

  const router = container.resolve(TOKENS.router);

  createEffect(() => {
    const { pathname } = router.location;
    const { authenticatedMember } = state;

    if (authenticatedMember?.onboardingCompleted === false && pathname !== '/onboarding') {
      router.navigate(routes.onboarding);
    }

    if (authenticatedMember?.onboardingCompleted === true && pathname === '/onboarding') {
      router.navigate(routes.home);
    }
  });
}
