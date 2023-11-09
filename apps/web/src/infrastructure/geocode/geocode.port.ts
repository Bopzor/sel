import { Address } from '@sel/shared';

export interface GeocodePort {
  search(query: string): Promise<Array<[formatted: string, address: Address]>>;
}
