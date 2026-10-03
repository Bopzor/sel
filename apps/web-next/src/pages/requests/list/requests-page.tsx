import { Trans } from '@lingui/react/macro';
import { LinkButton } from '@sel/ui';

import { routes } from 'src/app/routes';
import { Link } from 'src/components/link';
import { useDebouncedValue } from 'src/hooks/use-debounced-value';
import { useFilters } from 'src/hooks/use-filters';

import { RequestList } from './request-item';
import { RequestFiltersBar, requestsFiltersSchema } from './requests-filters';

export function RequestsPage() {
  const { filters, setFilters, hasFilters, resetFilters } = useFilters(requestsFiltersSchema);

  const [search, setSearch, clearSearch] = useDebouncedValue(filters.search, (value) =>
    setFilters({ search: value }, { replace: true }),
  );

  const clearFilters = () => {
    clearSearch();
    resetFilters();
  };

  return (
    <div className="stack gap-6">
      <header className="row flex-wrap items-center justify-between gap-4">
        <h1 className="text-title-1">
          <Trans>Requests</Trans>
        </h1>

        <LinkButton Link={Link} href={routes.createRequest()} icon="add" className="max-sm:w-full xl:w-aside">
          <Trans>New request</Trans>
        </LinkButton>
      </header>

      <div className="stack gap-6 xl:flex-row-reverse xl:items-start xl:gap-10">
        <aside className="xl:sticky xl:top-10 xl:w-aside xl:shrink-0">
          <RequestFiltersBar filters={filters} search={search} onSearch={setSearch} onChange={setFilters} />
        </aside>

        <div className="min-w-0 flex-1">
          <RequestList filters={filters} hasFilters={hasFilters} onClearFilters={clearFilters} />
        </div>
      </div>
    </div>
  );
}
