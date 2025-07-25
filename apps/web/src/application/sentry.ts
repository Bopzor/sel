import * as Sentry from '@sentry/solid';

import pkg from '../../package.json';
import { ApiError } from './api';
import { getAppConfig } from './config';

export function initSentry() {
  const { environment, sentryDsn } = getAppConfig();

  Sentry.init({
    dsn: sentryDsn,
    environment,
    integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration({ maskAllText: false })],
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    beforeSend(event, hint) {
      const error = hint.originalException;

      event.contexts ??= {};
      event.contexts.app ??= {};
      event.contexts.app.app_version = pkg.version;

      if (ApiError.is(error)) {
        if (Math.floor(error.status / 100) === 4) {
          return null;
        }

        event.contexts.response ??= {};
        event.contexts.response.status_code = error.status;

        event.extra ??= {};
        event.extra.body = error.body;
      }

      return event;
    },
  });
}

export function setSentryUserId(id: string | null) {
  Sentry.setUser(id ? { id } : null);
}
