import { Trans, useLingui } from '@lingui/react/macro';
import { MembersSort } from '@sel/shared';
import { Chip, Input, LinkButton } from '@sel/ui';
import z from 'zod';

import { routes } from 'src/app/routes';
import { Link } from 'src/components/link';
import { useFilters } from 'src/hooks/use-filters';

import { MembersList } from './members-list';

const filtersSchema = z.object({
  search: z.string().catch(''),
  sort: z.enum(MembersSort).catch(MembersSort.firstName),
  committee: z.stringbool().catch(false),
});

export function MembersPage() {
  const { filters, setFilters } = useFilters(filtersSchema);

  return (
    <div className="stack gap-6">
      <div className="row items-center justify-between gap-4">
        <h1 className="text-title-1">
          <Trans>Members</Trans>
        </h1>

        <LinkButton Link={Link} href={routes.membersMap()} variant="secondary" icon="map">
          <Trans>Map</Trans>
        </LinkButton>
      </div>

      <Filters filters={filters} setFilters={setFilters} />

      <MembersList
        sort={filters.sort}
        search={filters.search}
        committee={filters.committee}
        onClearFilters={() => setFilters({ search: '', committee: false })}
      />
    </div>
  );
}

type FiltersProps = {
  filters: z.infer<typeof filtersSchema>;
  setFilters: (filters: Partial<z.infer<typeof filtersSchema>>, options?: { replace?: boolean }) => void;
};

function Filters({ filters, setFilters }: FiltersProps) {
  const { t } = useLingui();

  const sorts = [
    { value: MembersSort.firstName, label: t({ message: 'First name', context: 'members sort' }) },
    { value: MembersSort.lastName, label: t({ message: 'Last name', context: 'members sort' }) },
    { value: MembersSort.membershipDate, label: t({ message: 'Newest', context: 'members sort' }) },
  ];

  return (
    <div className="stack gap-3 min-[1400px]:flex-row min-[1400px]:items-center min-[1400px]:justify-between">
      <Input
        type="search"
        icon="search"
        aria-label={t`Search members`}
        placeholder={t`Search members`}
        value={filters.search}
        onChange={(event) => setFilters({ search: event.target.value }, { replace: true })}
        className="max-w-110 min-[1400px]:flex-1"
      />

      <div className="stack gap-2 sm:flex-row sm:items-center sm:gap-3">
        <div role="group" aria-label={t`Sort`} className="row flex-wrap gap-2">
          {sorts.map(({ value, label }) => (
            <Chip
              key={value}
              selected={filters.sort === value}
              onChange={() => setFilters({ sort: value })}
              className="whitespace-nowrap"
            >
              {label}
            </Chip>
          ))}
        </div>

        <div aria-hidden className="h-6 border-l-2 max-sm:hidden" />

        <div className="row flex-wrap gap-2">
          <Chip
            selected={filters.committee}
            onChange={(committee) => setFilters({ committee })}
            className="whitespace-nowrap"
          >
            <Trans>Committee members</Trans>
          </Chip>
        </div>
      </div>
    </div>
  );
}
