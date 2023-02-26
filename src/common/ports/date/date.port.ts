import { Timestamp } from '../../timestamp.value-object';

export interface DatePort {
  now(): Timestamp;
}
