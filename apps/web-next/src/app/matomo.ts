import type { DataRouter } from 'react-router';

import { getEnv } from './env';

declare global {
  var _paq: unknown[][] | undefined;
}

export function setMatomoUser(memberId: string | null) {
  globalThis._paq?.push(memberId === null ? ['resetUserId'] : ['setUserId', memberId]);
}

export function initMatomo(router: Pick<DataRouter, 'state' | 'subscribe'>) {
  const url = getEnv('VITE_MATOMO_URL');
  const siteId = getEnv('VITE_MATOMO_SITE_ID');

  if (!url || !siteId) {
    return;
  }

  const paq = (globalThis._paq ??= []);
  const base = url.endsWith('/') ? url : `${url}/`;

  paq.push(['setTrackerUrl', `${base}matomo.php`], ['setSiteId', siteId], ['enableLinkTracking']);

  const script = document.createElement('script');

  script.async = true;
  script.src = `${base}matomo.js`;
  document.head.append(script);

  // The router doesn't notify the document: each navigation is a page view.
  let previousUrl: string | undefined;

  const trackPageView = () => {
    const { initialized, navigation, location } = router.state;
    const currentUrl = window.location.origin + import.meta.env.BASE_URL.slice(0, -1) + location.pathname;

    if (!initialized || navigation.state !== 'idle' || currentUrl === previousUrl) {
      return;
    }

    if (previousUrl) {
      paq.push(['setReferrerUrl', previousUrl]);
    }

    paq.push(['setCustomUrl', currentUrl], ['trackPageView']);
    previousUrl = currentUrl;
  };

  router.subscribe(trackPageView);
  trackPageView();
}
