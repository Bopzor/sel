import { Trans, useLingui } from '@lingui/react/macro';
import { RequestStatus } from '@sel/shared';
import { Chip, Input } from '@sel/ui';
import z from 'zod';

export const requestsFiltersSchema = z.object({
  status: z.enum([RequestStatus.pending, 'all']).catch(RequestStatus.pending),
  search: z.string().catch(''),
  mine: z.stringbool().catch(false),
});

export type RequestFilters = z.output<typeof requestsFiltersSchema>;

type FiltersBarProps = {
  filters: RequestFilters;
  search: string;
  onSearch: (search: string) => void;
  onChange: (changes: Partial<RequestFilters>) => void;
};

export function RequestFiltersBar({ filters, search, onSearch, onChange }: FiltersBarProps) {
  const { t } = useLingui();

  const statuses = [
    { value: RequestStatus.pending, label: t({ message: 'Open', context: 'requests filter' }) },
    { value: 'all', label: t({ message: 'All', context: 'requests filter' }) },
  ] as const;

  return (
    <div className="stack gap-3">
      <Input
        type="search"
        icon="search"
        aria-label={t`Search the requests`}
        placeholder={t`Search`}
        value={search}
        onChange={(event) => onSearch(event.target.value)}
      />

      <div className="row flex-wrap gap-2">
        {statuses.map(({ value, label }) => (
          <Chip key={value} selected={filters.status === value} onChange={() => onChange({ status: value })}>
            {label}
          </Chip>
        ))}

        <Chip icon="profile" selected={filters.mine} onChange={(mine) => onChange({ mine })}>
          <Trans>My requests</Trans>
        </Chip>
      </div>
    </div>
  );
}
