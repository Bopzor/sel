import { add } from 'date-fns';

export function createDate(date?: string) {
  return new Date(date ?? Date.now());
}

type Duration = {
  hours: number;
};

export function addDuration(date: Date, duration: Duration): Date {
  return add(date, duration);
}
