import { onCleanup, onMount } from 'solid-js';

import { TOKENS } from '../../tokens';
import { container } from '../container';

import { MatomoAnalyticsAdapter } from './matomo-analytics.adapter';

export function MatomoScript() {
  const client = container.resolve(TOKENS.analytics);

  onMount(() => {
    if (client instanceof MatomoAnalyticsAdapter && client.snippet) {
      const script = document.createElement('script');

      script.id = 'matomo-snippet';
      script.innerHTML = client.snippet;
      document.body.appendChild(script);
    }
  });

  onCleanup(() => {
    const snippet = document.getElementById('matomo-snippet');

    if (snippet) {
      snippet.parentElement?.removeChild(snippet);
    }
  });

  return null;
}
