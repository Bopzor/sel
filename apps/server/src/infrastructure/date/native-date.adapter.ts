import { injectableClass } from 'ditox';

import { DatePort } from './date.port';

export class NativeDateAdapter implements DatePort {
  static inject = injectableClass(this);

  now(): Date {
    return new Date();
  }
}
