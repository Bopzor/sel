import { Component, createEffect } from 'solid-js';

import { TOKENS } from '../../tokens';
import { container } from '../container';

import { MatomoAnalyticsAdapter } from './matomo-analytics.adapter';

export const MatomoScript: Component = () => {
  const client = container.resolve(TOKENS.analytics);

  createEffect(() => {
    if (client instanceof MatomoAnalyticsAdapter && client.snippet) {
      const script = document.createElement('script');

      script.innerHTML = client.snippet;
      document.body.appendChild(script);
    }
  });

  return null;
};
