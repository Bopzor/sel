import { ValueObject } from './ddd/value-object';

export class Timestamp extends ValueObject<number> {
  static from(value: string | Date) {
    return new Timestamp(new Date(value).getTime());
  }

  toString() {
    return new Date(this.value).toISOString();
  }

  get asDate() {
    return new Date(this.value);
  }
}
