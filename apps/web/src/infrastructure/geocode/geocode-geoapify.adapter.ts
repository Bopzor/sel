import { Address } from '@sel/shared';
import { injectable } from 'ditox';

import { Fetcher, FetcherPort } from '../../fetcher';
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
  static inject = injectable((config) => new GeoapifyGeocodeAdapter(config, new Fetcher()), TOKENS.config);

  constructor(private readonly config: ConfigPort, private readonly fetcher: FetcherPort) {}

  async search(query: string): Promise<Array<[formatted: string, address: Address]>> {
    const { body } = await this.fetcher.get<QueryResult>(this.url(query));

    if (!body.features) {
      return [];
    }

    return body.features.map(({ properties }) => [
      properties.formatted,
      {
        line1: properties.address_line1,
        city: properties.city,
        postalCode: properties.postcode,
        country: properties.country,
        position: [properties.lon, properties.lat],
      },
    ]);
  }

  private url(query: string) {
    const params = new URLSearchParams({
      text: query,
      apiKey: this.config.geoapify.apiKey,
    });

    return `https://api.geoapify.com/v1/geocode/search?${params}`;
  }
}
