import { add } from 'date-fns/add';
import { formatDistanceToNowStrict } from 'date-fns/formatDistanceToNowStrict';
import { fr } from 'date-fns/locale/fr';

export { endOfWeek } from 'date-fns/endOfWeek';
export { getDay } from 'date-fns/getDay';
export { isAfter } from 'date-fns/isAfter';
export { isPast } from 'date-fns/isPast';
export { isSameDay } from 'date-fns/isSameDay';
export { isSameMonth } from 'date-fns/isSameMonth';
export { isSameWeek } from 'date-fns/isSameWeek';
export { isToday } from 'date-fns/isToday';
export { lastDayOfMonth } from 'date-fns/lastDayOfMonth';
export { startOfDay } from 'date-fns/startOfDay';
export { startOfMonth } from 'date-fns/startOfMonth';
export { startOfWeek } from 'date-fns/startOfWeek';

export function createDate(date?: string) {
  return new Date(date ?? Date.now());
}

// while Intl.DurationFormat isn't fully supported
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DurationFormat
export function formatDateRelative(date: string, addSuffix = true) {
  return formatDistanceToNowStrict(createDate(date), { locale: fr, addSuffix });
}

export type Duration = {
  hours?: number;
  days?: number;
  months?: number;
};

export function addDuration(date: Date, duration: Duration): Date {
  return add(date, duration);
}
