import { Trans, useLingui } from '@lingui/react/macro';
import { Chip, Input } from '@sel/ui';

export type InformationFilters = {
  search: string;
  mine: boolean;
};

type FiltersBarProps = {
  filters: InformationFilters;
  search: string;
  onSearch: (search: string) => void;
  onChange: (changes: Partial<InformationFilters>) => void;
};

export function InformationFiltersBar({ filters, search, onSearch, onChange }: FiltersBarProps) {
  const { t } = useLingui();

  return (
    <div className="stack gap-3">
      <Input
        type="search"
        icon="search"
        aria-label={t`Search the information`}
        placeholder={t`Search`}
        value={search}
        onChange={(event) => onSearch(event.target.value)}
      />

      <div className="row flex-wrap gap-2">
        <Chip icon="profile" selected={filters.mine} onChange={(mine) => onChange({ mine })}>
          <Trans>My information</Trans>
        </Chip>
      </div>
    </div>
  );
}
