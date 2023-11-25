import { useLocation, useNavigate } from '@solidjs/router';
import { createEffect } from 'solid-js';

import { getAuthenticatedMemberUnsafe } from '../utils/authenticated-member';

export function redirectToOnboardingWhenNotCompleted() {
  const [member] = getAuthenticatedMemberUnsafe();

  const location = useLocation();
  const navigate = useNavigate();

  createEffect(() => {
    if (member()?.onboardingCompleted === false && location.pathname !== '/onboarding') {
      navigate('/onboarding');
    }

    if (member()?.onboardingCompleted === true && location.pathname === '/onboarding') {
      navigate('/');
    }
  });
}
