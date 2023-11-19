import { injectableClass } from 'ditox';

import { TOKENS } from '../../tokens';
import { ConfigPort } from '../config/config.port';

import { AnalyticsPort } from './analytics.port';

export class MatomoAnalyticsAdapter implements AnalyticsPort {
  static inject = injectableClass(this, TOKENS.config);

  private client: MatomoClient;

  constructor(config: ConfigPort) {
    this.client = new MatomoClient(config.analytics);
  }

  get snippet() {
    return this.client.snippet;
  }

  pageView(url: string): void {
    this.client.trackPageView(url);
  }
}

declare global {
  interface Window {
    _paq?: unknown[][];
  }
}

class MatomoClient {
  constructor(private readonly config: Partial<{ url: string; siteId: number }>) {}

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

  get snippet() {
    const { url, siteId } = this.config;

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
