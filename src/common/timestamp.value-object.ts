import { ValueObject } from './ddd/value-object';

export class Timestamp extends ValueObject<number> {
  static from(dateStr: string) {
    return new Timestamp(new Date(dateStr).getTime());
  }

  toString() {
    return new Date(this.value).toISOString();
  }

  get asDate() {
    return new Date(this.value);
  }
}
