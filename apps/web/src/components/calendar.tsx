import {
  addDuration,
  createArray,
  endOfWeek,
  getDay,
  isSameDay,
  isSameMonth,
  isSameWeek,
  last,
  lastDayOfMonth,
  startOfWeek,
} from '@sel/utils';
import { For, createMemo } from 'solid-js';

import { FormattedDate } from '../intl/formatted';

type CalendarProps = {
  year: number;
  month: number;
};

export function Calendar(props: CalendarProps) {
  const days = createMemo(() => createCalendarDays(props.year, props.month));

  return (
    <div class="grid grid-cols-7">
      <For each={createArray(7, (index) => index + 1)}>
        {(day) => (
          <div class="py-2 text-center capitalize">
            <FormattedDate date={new Date(2024, 0, day)} weekday="long" />
          </div>
        )}
      </For>

      <For each={days()}>
        {(day) => (
          <div
            class="h-32 border-l border-t"
            classList={{
              'border-r': day.isEndOfWeek,
              'border-b': day.isLastWeek,
              'rounded-tl': day.isFirst,
              'rounded-tr': day.isLastDayOfFirstWeek,
              'rounded-bl': day.isFirstDayOfLastWeek,
              'rounded-br': day.isLast,
              'bg-gray-50 text-gray-500': !day.isMonth,
              'bg-neutral': day.isMonth,
              'shadow-current-day': day.isMonth && day.isToday,
            }}
          >
            <div class="p-2 font-medium">{day.date.getDate()}</div>
          </div>
        )}
      </For>
    </div>
  );
}

function createCalendarDays(year: number, month: number) {
  const first = new Date(year, month - 1);
  const last = lastDayOfMonth(first);

  const days = [
    ...createDaysRange(startOfWeek(first, { weekStartsOn: 1 }), first),
    ...createDaysRange(first, last),
    ...createDaysRange(last, endOfWeek(last, { weekStartsOn: 1 })),
    endOfWeek(last, { weekStartsOn: 1 }),
  ];

  return createDaysData(year, month, days);
}

function createDaysRange(start: Date, end: Date) {
  const days = [];
  let day = start;

  while (!isSameDay(day, end)) {
    days.push(day);
    day = addDuration(day, { days: 1 });
  }

  return days;
}

function createDaysData(year: number, month: number, days: Date[]) {
  const first = new Date(year, month - 1);

  return days.map((date, index) => ({
    date,
    isFirst: index === 0,
    isLast: index === days.length - 1,
    isEndOfWeek: getDay(date) === 0,
    isLastWeek: isSameWeek(date, last(days), { weekStartsOn: 1 }),
    isLastDayOfFirstWeek: date === days[6],
    isFirstDayOfLastWeek: date === days[days.length - 7],
    isMonth: isSameMonth(first, date),
    isToday: isSameDay(new Date(), date),
  }));
}
