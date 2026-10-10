import { Trans, useLingui } from '@lingui/react/macro';
import { Chip, Input } from '@sel/ui';

export type EventFilters = {
  timing: 'all' | 'past' | 'upcoming';
  search: string;
  mine: boolean;
  going: boolean;
};

type FiltersBarProps = {
  filters: EventFilters;
  search: string;
  onSearch: (search: string) => void;
  onChange: (changes: Partial<EventFilters>) => void;
};

export function EventFiltersBar({ filters, search, onSearch, onChange }: FiltersBarProps) {
  const { t } = useLingui();

  const timings = [
    { value: 'upcoming', label: t({ message: 'Upcoming', context: 'events filter' }) },
    { value: 'past', label: t({ message: 'Past', context: 'events filter' }) },
    { value: 'all', label: t({ message: 'All', context: 'events filter' }) },
  ] as const;

  return (
    <div className="stack gap-3">
      <Input
        type="search"
        icon="search"
        aria-label={t`Search the events`}
        placeholder={t`Search`}
        value={search}
        onChange={(event) => onSearch(event.target.value)}
      />

      <div className="row flex-wrap gap-2">
        {timings.map(({ value, label }) => (
          <Chip key={value} selected={filters.timing === value} onChange={() => onChange({ timing: value })}>
            {label}
          </Chip>
        ))}

        <Chip selected={filters.going} onChange={(going) => onChange({ going })}>
          <Trans>I'm coming</Trans>
        </Chip>

        <Chip icon="profile" selected={filters.mine} onChange={(mine) => onChange({ mine })}>
          <Trans>My events</Trans>
        </Chip>
      </div>
    </div>
  );
}
