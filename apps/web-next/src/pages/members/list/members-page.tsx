import { Trans, useLingui } from '@lingui/react/macro';
import { MembersSort } from '@sel/shared';
import { Chip, Input } from '@sel/ui';
import z from 'zod';

import { useFilters } from 'src/hooks/use-filters';

import { MembersList } from './members-list';

const filtersSchema = z.object({
  search: z.string().catch(''),
  sort: z.enum(MembersSort).catch(MembersSort.firstName),
});

export function MembersPage() {
  const { filters, setFilters } = useFilters(filtersSchema);

  return (
    <div className="stack gap-6">
      <h1 className="text-title-1">
        <Trans>Members</Trans>
      </h1>

      <Filters filters={filters} setFilters={setFilters} />

      <MembersList
        sort={filters.sort}
        search={filters.search}
        onClearSearch={() => setFilters({ search: '' })}
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
    <div className="stack gap-3 md:flex-row md:items-center md:justify-between">
      <Input
        type="search"
        icon="search"
        aria-label={t`Search members`}
        placeholder={t`Search members`}
        value={filters.search}
        onChange={(event) => setFilters({ search: event.target.value }, { replace: true })}
        className="max-w-110 flex-1"
      />

      <div role="group" aria-label={t`Sort`} className="row flex-wrap gap-2">
        {sorts.map(({ value, label }) => (
          <Chip key={value} selected={filters.sort === value} onChange={() => setFilters({ sort: value })}>
            {label}
          </Chip>
        ))}
      </div>
    </div>
  );
}
