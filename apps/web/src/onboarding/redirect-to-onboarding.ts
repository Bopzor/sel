import { useLocation, useNavigate } from '@solidjs/router';
import { createEffect } from 'solid-js';

import { getAppState } from '../store/app-store';

export function redirectToOnboardingWhenNotCompleted() {
  const state = getAppState();

  const location = useLocation();
  const navigate = useNavigate();

  createEffect(() => {
    if (state.authenticatedMember?.onboardingCompleted === false && location.pathname !== '/onboarding') {
      navigate('/onboarding');
    }

    if (state.authenticatedMember?.onboardingCompleted === true && location.pathname === '/onboarding') {
      navigate('/');
    }
  });
}
