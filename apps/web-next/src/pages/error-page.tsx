import { Trans, useLingui } from '@lingui/react/macro';
import { Button, EmptyState, LinkButton } from '@sel/ui';
import { useRouteError } from 'react-router';

import { ApiError, NetworkError } from 'src/app/api';
import { routes } from 'src/app/routes';
import { Link } from 'src/components/link';

export function RootErrorBoundary() {
  return (
    <main className="grid min-h-dvh place-items-center">
      <ErrorState error={useRouteError()} />
    </main>
  );
}

export function PageErrorBoundary() {
  return <ErrorState error={useRouteError()} />;
}

export function NotFoundPage() {
  return (
    <EmptyState.Root icon="search">
      <EmptyState.Title level={1}>
        <Trans>Page not found</Trans>
      </EmptyState.Title>
      <EmptyState.Description>
        <Trans>The link may be wrong, or the page may no longer exist.</Trans>
      </EmptyState.Description>
      <EmptyState.Action>
        <LinkButton Link={Link} href={routes.home()} variant="secondary">
          <Trans>Back to home</Trans>
        </LinkButton>
      </EmptyState.Action>
    </EmptyState.Root>
  );
}

function ErrorState({ error }: { error: unknown }) {
  if (ApiError.is(error) && error.code === 'MaintenanceMode') {
    return <Maintenance error={error} />;
  }

  if (NetworkError.is(error)) {
    return (
      <EmptyState.Root icon="warning">
        <EmptyState.Title level={1}>
          <Trans>Unable to reach the server</Trans>
        </EmptyState.Title>
        <EmptyState.Description>
          <Trans>Check your internet access, then try again.</Trans>
        </EmptyState.Description>
        <EmptyState.Action>
          <RetryButton />
        </EmptyState.Action>
      </EmptyState.Root>
    );
  }

  return (
    <EmptyState.Root icon="error">
      <EmptyState.Title level={1}>
        <Trans>An unexpected error happened</Trans>
      </EmptyState.Title>

      <EmptyState.Description>
        {error instanceof Error ? error.message : String(error)}
      </EmptyState.Description>

      <EmptyState.Action>
        <RetryButton />
      </EmptyState.Action>

      <ErrorDetails error={error} />
    </EmptyState.Root>
  );
}

function ErrorDetails({ error }: { error: unknown }) {
  const stack = error instanceof Error ? error.stack : String(error);
  const body = ApiError.is(error) ? JSON.stringify(error.body, null, 2) : undefined;

  return (
    <details open={import.meta.env.DEV} className="mx-4 mt-6 w-full max-w-page">
      <summary className="mx-auto max-w-fit cursor-pointer text-body-sm text-subtle">
        <Trans>Show details</Trans>
      </summary>
      <pre className="overflow-x-auto rounded-md bg-surface-sunken p-4 text-left text-body-sm">
        {[stack, body].filter(Boolean).join('\n\n')}
      </pre>
    </details>
  );
}

function Maintenance({ error }: { error: ApiError }) {
  const { i18n } = useLingui();
  const { end } = error.body as { end?: string | null };

  const date = end
    ? Intl.DateTimeFormat(i18n.locale, { dateStyle: 'full', timeStyle: 'short' }).format(new Date(end))
    : undefined;

  return (
    <EmptyState.Root icon="time">
      <EmptyState.Title level={1}>
        <Trans>The application is under maintenance</Trans>
      </EmptyState.Title>
      <EmptyState.Description>
        {date === undefined ? (
          <Trans>It will be back soon.</Trans>
        ) : (
          <Trans>It will be back on {date}.</Trans>
        )}
      </EmptyState.Description>
      <EmptyState.Action>
        <RetryButton />
      </EmptyState.Action>
    </EmptyState.Root>
  );
}

// Reloads the page: the failure may have happened while the app was starting.
function RetryButton() {
  return (
    <Button variant="secondary" onClick={() => window.location.reload()}>
      <Trans>Retry</Trans>
    </Button>
  );
}
