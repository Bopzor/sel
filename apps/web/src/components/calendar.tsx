import {
  createArray,
  endOfWeek,
  getDay,
  isPast,
  isSameDay,
  isSameMonth,
  isSameWeek,
  last,
  lastDayOfMonth,
  startOfWeek,
} from '@sel/utils';
import { add } from 'date-fns';
import { For, JSX, createMemo } from 'solid-js';

import { useIntl } from 'src/intl/intl-provider';

type CalendarProps = {
  year: number;
  month: number;
  renderDay: (date: Date, day: Day) => JSX.Element;
};

export function Calendar(props: CalendarProps) {
  const days = createMemo(() => createCalendarDays(props.year, props.month));

  return (
    <div class="grid grid-cols-7">
      <For each={createArray(7, (index) => index + 1)}>
        {(day) => <div class="py-2 text-center capitalize">{getDayName(new Date(2024, 0, day))}</div>}
      </For>

      <For each={days()}>
        {(day) => (
          <div
            class="border-t border-l"
            classList={{
              'border-r': day.isEndOfWeek,
              'border-b': day.isLastWeek,
              'rounded-tl': day.isFirst,
              'rounded-tr': day.isLastDayOfFirstWeek,
              'rounded-bl': day.isFirstDayOfLastWeek,
              'rounded-br': day.isLast,
              'bg-neutral/50 text-gray-500': !day.isMonth,
              'bg-neutral': day.isMonth,
              'shadow-current-day': day.isToday,
            }}
          >
            {props.renderDay(day.date, day)}
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
    day = add(day, { days: 1 });
  }

  return days;
}

function createDaysData(year: number, month: number, days: Date[]) {
  const first = new Date(year, month - 1);

  return days.map(createDayData(days, first));
}

type Day = ReturnType<ReturnType<typeof createDayData>>;

function createDayData(days: Date[], first: Date) {
  return (date: Date, index: number) => {
    const isToday = isSameDay(new Date(), date);

    return {
      date,
      isFirst: index === 0,
      isLast: index === days.length - 1,
      isEndOfWeek: getDay(date) === 0,
      isLastWeek: isSameWeek(date, last(days), { weekStartsOn: 1 }),
      isLastDayOfFirstWeek: date === days[6],
      isFirstDayOfLastWeek: date === days[days.length - 7],
      isMonth: isSameMonth(first, date),
      isToday,
      isPast: isPast(date) && !isToday,
    };
  };
}

function getDayName(date: Date) {
  const intl = useIntl();
  const name = intl.formatDate(date, { weekday: 'long' });

  return name;
}
