import { Address } from '@sel/shared';

import { GeocodePort } from './geocode.port';

export class StubGeocodeAdapter implements GeocodePort {
  addresses = new Map<string, Address>();

  async search(): Promise<Array<[formatted: string, address: Address]>> {
    return Array.from(this.addresses.entries());
  }
}
