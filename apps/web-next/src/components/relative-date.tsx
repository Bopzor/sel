import { useLingui } from '@lingui/react/macro';
import { differenceInCalendarDays } from '@sel/utils';
import { useState } from 'react';

const minute = 60 * 1000;
const hour = 60 * minute;
const day = 24 * hour;

export function RelativeDate({ date, className }: { date: string; className?: string }) {
  const { i18n } = useLingui();
  const value = new Date(date);
  const [now] = useState(() => new Date());
  const elapsed = now.getTime() - value.getTime();
  // In calendar days: "yesterday" is the day before today, not 24 to 48 hours ago.
  const days = differenceInCalendarDays(now, value);

  const full = value.toLocaleDateString(i18n.locale, { dateStyle: 'full' });
  const relative = new Intl.RelativeTimeFormat(i18n.locale, { numeric: 'auto' });

  let label: string;

  if (elapsed < hour) {
    label = relative.format(-Math.max(1, Math.floor(elapsed / minute)), 'minute');
  } else if (elapsed < day) {
    label = relative.format(-Math.floor(elapsed / hour), 'hour');
  } else if (days < 7) {
    label = relative.format(-days, 'day');
  } else {
    const sameYear = value.getFullYear() === now.getFullYear();

    label = value.toLocaleDateString(i18n.locale, {
      day: 'numeric',
      month: 'long',
      year: sameYear ? undefined : 'numeric',
    });
  }

  return (
    <time dateTime={date} title={full} className={className}>
      {label}
    </time>
  );
}
