interface ImportMetaEnv {
  /** The server's base URL in production. Defaults to /api, which the dev server proxies. */
  readonly VITE_API_URL?: string;
  /** The VAPID public key used to subscribe to push notifications. Injected at runtime in production. */
  readonly VITE_WEB_PUSH_PUBLIC_KEY?: string;
}

/** The version of package.json. */
declare const __APP_VERSION__: string;

declare module '*.po' {
  import type { Messages } from '@lingui/core';

  export const messages: Messages;
}
