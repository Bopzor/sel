import { useLocation } from '@solidjs/router';
import { Component, createEffect } from 'solid-js';

import { TOKENS } from '../../tokens';
import { container } from '../container';

export const TrackPageView: Component = () => {
  const location = useLocation();
  const client = container.resolve(TOKENS.analytics);

  createEffect(() => {
    const url = [location.pathname, location.search, location.hash].filter(Boolean).join('');

    client.pageView(url);
  });

  return null;
};
