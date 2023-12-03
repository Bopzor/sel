import * as datefns from 'date-fns';
import fr from 'date-fns/locale/fr';

export function createDate(date?: string) {
  return new Date(date ?? Date.now());
}

// while Intl.DurationFormat isn't fully supported
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DurationFormat
export function formatDateRelative(date: string) {
  return datefns.formatDistanceToNowStrict(createDate(date), { locale: fr });
}

export type Duration = {
  hours?: number;
  months?: number;
};

export function addDuration(date: Date, duration: Duration): Date {
  return datefns.add(date, duration);
}

export const isAfter = datefns.isAfter;
