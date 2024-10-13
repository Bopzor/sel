import { Address } from '@sel/shared';
import { isDefined } from '@sel/utils';
import { injectableClass } from 'ditox';

import { TOKENS } from '../../tokens';
import { ConfigPort } from '../config/config.port';

import { GeocodePort } from './geocode.port';

type Feature = {
  properties: Partial<{
    country: string;
    postcode: string;
    city: string;
    lon: number;
    lat: number;
    formatted: string;
    address_line1: string;
  }>;
};

type QueryResult = {
  features?: Feature[];
};

export class GeoapifyGeocodeAdapter implements GeocodePort {
  static inject = injectableClass(this, TOKENS.config, TOKENS.fetch);

  constructor(
    private readonly config: ConfigPort,
    private readonly fetch: typeof window.fetch,
  ) {}

  async search(query: string): Promise<Array<[formatted: string, address: Address]>> {
    const response = await this.fetch(this.url(query));

    // todo: report error
    if (!response.ok) {
      throw new Error(`Failed to search for address: ${response.statusText}`);
    }

    const body: QueryResult = await response.json();

    if (!body.features) {
      return [];
    }

    const getAddress = ({ properties }: Feature) => {
      const { formatted, address_line1, city, postcode, country, lon, lat } = properties;

      if (!formatted || !address_line1 || !city || !postcode || !country || !lon || !lat) {
        return;
      }

      return [
        formatted,
        {
          line1: address_line1,
          city: city,
          postalCode: postcode,
          country: country,
          position: [lon, lat],
        },
      ] satisfies [string, Address];
    };

    return body.features.map(getAddress).filter(isDefined);
  }

  private url(query: string) {
    const params = new URLSearchParams({
      text: query,
      apiKey: this.config.geoapify.apiKey,
    });

    return `https://api.geoapify.com/v1/geocode/search?${params}`;
  }
}
