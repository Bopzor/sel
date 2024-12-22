import * as Sentry from '@sentry/solid';

import { ApiError } from './api';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.VITE_ENVIRONMENT,
  integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

export function reportError(error: Error) {
  if (ApiError.is(error) && Math.floor(error.status / 100) === 4) {
    return;
  }

  if (ApiError.is(error)) {
    Sentry.captureException(error, {
      contexts: { response: { status_code: error.status, body: error.body } },
    });
  } else {
    Sentry.captureException(error);
  }
}
