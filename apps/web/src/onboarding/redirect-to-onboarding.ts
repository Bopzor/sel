import { useLocation, useNavigate } from '@solidjs/router';
import { createEffect } from 'solid-js';

import { selectAuthenticatedMemberUnsafe } from '../authentication/authentication.slice';
import { selector } from '../store/selector';

export function redirectToOnboardingWhenNotCompleted() {
  const member = selector(selectAuthenticatedMemberUnsafe);

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
