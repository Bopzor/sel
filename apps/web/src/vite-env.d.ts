/// <reference types="vite-plugin-solid-svg/types-component-solid" />
/// <reference types="vite/client" />

declare const __APP_VERSION__: string;

interface ImportMetaEnv {
  readonly VITE_ENVIRONMENT: string;
  readonly VITE_GEOAPIFY_API_KEY: string;
  readonly VITE_WEB_PUSH_PUBLIC_KEY: string;
  readonly VITE_ANALYTICS_URL: string;
  readonly VITE_ANALYTICS_SITE_ID: string;
  readonly VITE_SENTRY_DSN: string;
  readonly VITE_CONTACT_LINK: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
