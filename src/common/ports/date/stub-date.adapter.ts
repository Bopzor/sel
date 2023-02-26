import { Timestamp } from '../../timestamp.value-object';

import { DatePort } from './date.port';

export class StubDateAdapter implements DatePort {
  private currentDate = new Timestamp(0);

  setNow(date: Timestamp) {
    this.currentDate = date;
  }

  now() {
    return this.currentDate;
  }
}
