interface ImportMetaEnv {
  /** The name of the deployment (production, staging…), to tell the errors apart in Sentry. */
  readonly VITE_ENVIRONMENT?: string;
  /** Where the errors and the web vitals are sent. Nothing is sent when unset. */
  readonly VITE_SENTRY_DSN?: string;
  /** The base url of the Matomo instance that page views are sent to. Nothing is sent when unset. */
  readonly VITE_MATOMO_URL?: string;
  /** The id of the site in Matomo. Nothing is sent when unset. */
  readonly VITE_MATOMO_SITE_ID?: string;
  /** The VAPID public key used to subscribe to push notifications. Injected at runtime in production. */
  readonly VITE_WEB_PUSH_PUBLIC_KEY?: string;
}

/** The version of package.json. */
declare const __APP_VERSION__: string;

declare module '*.po' {
  import type { Messages } from '@lingui/core';

  export const messages: Messages;
}
