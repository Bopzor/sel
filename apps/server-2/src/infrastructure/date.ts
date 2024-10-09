import { injectableClass } from 'ditox';

export interface DatePort {
  now(): Date;
}

export class RuntimeDateAdapter implements DatePort {
  static inject = injectableClass(this);

  now() {
    return new Date();
  }
}
