import * as Sentry from '@sentry/react';
import { reactRouterBrowserTracingIntegration } from '@sentry/react/react-router';
import type { ErrorInfo } from 'react';

import { ApiError, NetworkError } from './api';
import { getEnv } from './env';

export function initSentry() {
  Sentry.init({
    dsn: getEnv('VITE_SENTRY_DSN'),
    environment: getEnv('VITE_ENVIRONMENT'),
    release: __APP_VERSION__,
    integrations: [reactRouterBrowserTracingIntegration(), Sentry.replayIntegration()],
    tracesSampleRate: 1,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1,
    beforeSend(event, { originalException: error }) {
      if (isExpected(error)) {
        return null;
      }

      if (ApiError.is(error)) {
        event.contexts = { ...event.contexts, response: { status_code: error.status } };
        event.extra = { ...event.extra, body: error.body };
      }

      return event;
    },
  });
}

export function captureError(error: unknown, errorInfo?: ErrorInfo) {
  if (isExpected(error)) {
    return;
  }

  if (errorInfo) {
    Sentry.captureReactException(error, errorInfo);
  } else {
    // React already logs the render errors.
    if (import.meta.env.DEV && import.meta.env.MODE !== 'test') {
      // oxlint-disable-next-line no-console
      console.error(error);
    }

    Sentry.captureException(error);
  }
}

// Expected errors are handled by the application
function isExpected(error: unknown) {
  return NetworkError.is(error) || (ApiError.is(error) && error.status < 500);
}
