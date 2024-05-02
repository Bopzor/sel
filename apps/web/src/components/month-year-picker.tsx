import { createArray } from '@sel/utils';

import { FormattedDate } from '../intl/formatted';

import { Input } from './input';
import { Select } from './select';

export function MonthYearPicker(props: {
  month: number;
  onMonthChange: (month: number) => void;
  year: number;
  onYearChange: (year: number) => void;
}) {
  return (
    <>
      <Select
        width="small"
        items={createArray(12, (index) => index + 1)}
        itemToString={(date) => String(date)}
        renderItem={(month) => (
          <div class="capitalize">
            <FormattedDate date={new Date(2024, month - 1)} month="long" />
          </div>
        )}
        selectedItem={() => props.month}
        onItemSelected={(month) => props.onMonthChange(month)}
      />

      <Input
        type="number"
        width="small"
        value={props.year}
        onInput={(event) => props.onYearChange(event.target.valueAsNumber)}
      />
    </>
  );
}
