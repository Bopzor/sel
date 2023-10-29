import { DatePort } from './date.port';

export class StubDate implements DatePort {
  date = new Date();

  now(): Date {
    return this.date;
  }
}
