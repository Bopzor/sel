import { Timestamp } from '../../timestamp.value-object';

import { DatePort } from './date.port';

export class RealDateAdapter implements DatePort {
  now(): Timestamp {
    return new Timestamp(Date.now());
  }
}
