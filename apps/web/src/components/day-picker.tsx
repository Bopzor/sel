import { startOfMonth, addDuration, isSameDay, isToday, isPast, isSameMonth } from '@sel/utils';
import { Icon } from 'solid-heroicons';
import { chevronLeft, chevronRight } from 'solid-heroicons/solid';
import { createSignal, createEffect } from 'solid-js';

import { getMonthName } from '../intl/date';

import { Calendar } from './calendar';

export function DayPicker(props: { value: Date | null; onChange: (date: Date) => void }) {
  // eslint-disable-next-line solid/reactivity
  const [value, setValue] = createSignal(startOfMonth(props.value ?? new Date()));

  createEffect(() => {
    setValue(startOfMonth(props.value ?? new Date()));
  });

  return (
    <div>
      <div class="grid grid-cols-3 items-center">
        <button
          type="button"
          class="ml-auto"
          onClick={() => setValue((value) => addDuration(value, { months: -1 }))}
        >
          <Icon path={chevronLeft} class="size-5 stroke-2" />
        </button>

        <span class="text-center font-medium capitalize">
          {getMonthName(value())} {value().getFullYear()}
        </span>

        <button
          type="button"
          class="mr-auto"
          onClick={() => setValue((value) => addDuration(value, { months: 1 }))}
        >
          <Icon path={chevronRight} class="size-5 stroke-2" />
        </button>
      </div>

      <Calendar
        month={value().getMonth() + 1}
        year={value().getFullYear()}
        renderDay={(date, day) => (
          <Day
            date={date}
            isPast={day.isPast}
            isSelected={Boolean(
              props.value && isSameDay(date, props.value) && (isToday(date) || !isPast(date)),
            )}
            onClick={() => {
              props.onChange(date);

              if (!isSameMonth(date, value())) {
                setValue(startOfMonth(date));
              }
            }}
          />
        )}
        useAbbreviation
      />
    </div>
  );
}

function Day(props: { date: Date; isPast: boolean; isSelected: boolean; onClick: () => void }) {
  return (
    <div class="p-1">
      <button
        type="button"
        class="w-full rounded py-4 text-center font-medium"
        classList={{ 'bg-primary text-white': props.isSelected, 'text-dim/50': props.isPast }}
        disabled={props.isPast}
        onClick={() => props.onClick()}
      >
        {props.date.getDate()}
      </button>
    </div>
  );
}
