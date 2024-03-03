import {
  addDuration,
  assert,
  createArray,
  endOfWeek,
  getDay,
  isSameDay,
  isSameMonth,
  isSameWeek,
  last,
  lastDayOfMonth,
  startOfDay,
  startOfWeek,
} from '@sel/utils';
import { For, createMemo } from 'solid-js';

import { FormattedDate } from '../intl/formatted';

export type CalendarEvent = {
  date: Date;
  title: string;
  class: string;
};

type CalendarProps = {
  year: number;
  month: number;
  events?: CalendarEvent[];
};

export function Calendar(props: CalendarProps) {
  const days = createMemo(() => createCalendarDays(props.year, props.month));

  const events = createMemo(() => {
    const events: Record<string, Array<CalendarEvent>> = {};

    for (const event of props.events ?? []) {
      const day = startOfDay(event.date).toISOString();

      if (!events[day]) {
        events[day] = [];
      }

      events[day].push(event);
    }

    return events;
  });

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
            class="h-32 border-l border-t p-2 text-sm"
            classList={{
              'border-r': day.isEndOfWeek,
              'border-b': day.isLastWeek,
              'rounded-tl': day.isFirst,
              'rounded-tr': day.isLastDayOfFirstWeek,
              'rounded-bl': day.isFirstDayOfLastWeek,
              'rounded-br': day.isLast,
              'bg-neutral/50 text-gray-500': !day.isMonth,
              'bg-neutral': day.isMonth,
              'shadow-current-day': day.isMonth && day.isToday,
            }}
          >
            <div class="mb-2 font-medium">{day.date.getDate()}</div>
            <For each={events()[day.date.toISOString()]}>
              {(event) => <div class={event.class}>{event.title}</div>}
            </For>
          </div>
        )}
      </For>
    </div>
  );
}

function createCalendarDays(year: number, month: number) {
  assert(typeof year === 'number', `year is ${typeof year}`);
  assert(typeof month === 'number', `month is ${typeof month}`);

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
