import { Trans } from '@lingui/react/macro';
import { Button } from '@sel/ui';
import type { UseInfiniteQueryResult } from '@tanstack/react-query';

import { ApiFailed } from './api-result';

export function Pagination({
  query,
  children,
}: {
  query: UseInfiniteQueryResult;
  children: React.ReactNode;
}) {
  return (
    <div className="stack items-center gap-3">
      {/* A live region, so that screen readers announce the result of a filter or of "Show more". */}
      <p role="status" className="text-body-sm text-muted">
        {children}
      </p>

      {query.hasNextPage && !query.isFetchNextPageError && (
        <Button
          variant="secondary"
          loading={query.isFetchingNextPage}
          onClick={() => void query.fetchNextPage()}
        >
          <Trans>Show more</Trans>
        </Button>
      )}
    </div>
  );
}

export function FetchNextPageError({ query }: { query: UseInfiniteQueryResult }) {
  if (!query.isFetchNextPageError) {
    return null;
  }

  return (
    <ApiFailed
      title={<Trans>Unable to load more elements</Trans>}
      retrying={query.isFetchingNextPage}
      retry={() => void query.fetchNextPage()}
    />
  );
}
