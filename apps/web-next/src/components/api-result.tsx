import { Trans } from '@lingui/react/macro';
import { Alert, AlertActions, AlertDescription, AlertTitle, Button } from '@sel/ui';
import type { UseQueryResult } from '@tanstack/react-query';

import { ApiError } from 'src/app/api';

export function QueryResult<T>({
  query,
  notFound,
  failed,
  loading,
  empty,
  children,
}: {
  query: UseQueryResult<T>;
  notFound?: React.ReactNode;
  failed: React.ReactNode;
  loading: React.ReactNode;
  empty?: React.ReactNode;
  children: (data: T) => React.ReactNode;
}) {
  if (query.error && !query.data) {
    if (ApiError.is(query.error, 404) && notFound) {
      return notFound;
    }

    return failed;
  }

  if (!query.data) {
    return loading;
  }

  if (isEmpty(query.data)) {
    return empty;
  }

  return children(query.data);
}

function isEmpty(data: unknown) {
  return (
    (Array.isArray(data) && data.length === 0) ||
    (typeof data === 'object' && data !== null && 'total' in data && data.total === 0)
  );
}

export function ApiFailed({
  title,
  retrying,
  retry,
}: {
  title: React.ReactNode;
  retrying?: boolean;
  retry?: () => void;
}) {
  return (
    <Alert tone="danger">
      <AlertTitle>{title}</AlertTitle>

      <AlertDescription>
        <Trans>Check your internet access, then try again.</Trans>
      </AlertDescription>

      {retry && (
        <AlertActions>
          <Button size="sm" variant="secondary" loading={retrying} onClick={retry}>
            <Trans>Retry</Trans>
          </Button>
        </AlertActions>
      )}
    </Alert>
  );
}
