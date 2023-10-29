import * as datefns from 'date-fns';

export function createDate(date?: string) {
  return new Date(date ?? Date.now());
}

export type Duration = {
  hours?: number;
  months?: number;
};

export function addDuration(date: Date, duration: Duration): Date {
  return datefns.add(date, duration);
}

export const isAfter = datefns.isAfter;
