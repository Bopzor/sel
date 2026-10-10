import { Trans } from '@lingui/react/macro';
import { LinkButton } from '@sel/ui';
import z from 'zod';

import { routes } from 'src/app/routes';
import { Link } from 'src/components/link';
import { useDebouncedValue } from 'src/hooks/use-debounced-value';
import { useFilters } from 'src/hooks/use-filters';

import { EventFiltersBar } from './events-filters';
import { EventList } from './events-list';

const filtersSchema = z.object({
  timing: z.enum(['upcoming', 'past', 'all']).catch('upcoming'),
  search: z.string().catch(''),
  mine: z.stringbool().catch(false),
  going: z.stringbool().catch(false),
});

export function EventsPage() {
  const { filters, setFilters, hasFilters, resetFilters } = useFilters(filtersSchema);

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
          <Trans>Events</Trans>
        </h1>

        <LinkButton Link={Link} href={routes.createEvent()} icon="add" className="max-sm:w-full xl:w-aside">
          <Trans>New event</Trans>
        </LinkButton>
      </header>

      <div className="stack gap-6 xl:flex-row-reverse xl:items-start xl:gap-10">
        <aside className="xl:sticky xl:top-10 xl:w-aside xl:shrink-0">
          <EventFiltersBar filters={filters} search={search} onSearch={setSearch} onChange={setFilters} />
        </aside>

        <div className="min-w-0 flex-1">
          <EventList filters={filters} hasFilters={hasFilters} onClearFilters={clearFilters} />
        </div>
      </div>
    </div>
  );
}
