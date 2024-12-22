import { useLocation } from '@solidjs/router';
import { createComponent, createContext, createEffect, JSX, onCleanup, onMount, useContext } from 'solid-js';

import { getAppConfig } from './config';

const context = createContext<MatomoClient>();

export function MatomoProvider(props: { children: JSX.Element }) {
  const client = new MatomoClient();

  injectScript(client);
  trackPageView(client);

  return createComponent(context.Provider, { value: client, ...props });
}

function injectScript(client: MatomoClient) {
  const script = document.createElement('script');

  onMount(() => {
    const { analyticsUrl, analyticsSiteId } = getAppConfig();
    const snippet = client.snippet(analyticsUrl, analyticsSiteId);

    if (snippet) {
      script.innerHTML = snippet;
      document.body.appendChild(script);
    }
  });

  onCleanup(() => {
    script.parentElement?.removeChild(script);
  });
}

function trackPageView(client: MatomoClient) {
  const location = useLocation();

  createEffect(() => {
    const url = [location.pathname, location.search, location.hash].filter(Boolean).join('');

    client.trackPageView(url);
  });
}

export function useTrackEvent() {
  const client = useContext(context);

  return (...params: Parameters<MatomoClient['trackEvent']>) => {
    client?.trackEvent(...params);
  };
}

declare global {
  interface Window {
    _paq?: unknown[][];
  }
}

class MatomoClient {
  private get _paq() {
    return window._paq;
  }

  trackPageView(url: string) {
    this._paq?.push(['setCustomUrl', url]);
    this._paq?.push(['trackPageView']);
  }

  trackEvent(category: string, action: string, { name, value }: { name?: string; value?: number } = {}) {
    this._paq?.push(['trackEvent', category, action, name, value]);
  }

  snippet(url: string, siteId: string) {
    if (!url || !siteId) {
      return undefined;
    }

    return `
var _paq = window._paq = window._paq || [];

_paq.push(['enableLinkTracking']);

(function() {
  var u="${url}/";

  _paq.push(['setTrackerUrl', u+'matomo.php']);
  _paq.push(['setSiteId', ${siteId}]);

  var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
  g.type='text/javascript'; g.async=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
})();`;
  }
}
