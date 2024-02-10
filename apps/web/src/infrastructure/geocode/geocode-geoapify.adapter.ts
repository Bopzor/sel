import { Address } from '@sel/shared';
import { isDefined } from '@sel/utils';
import { injectable } from 'ditox';

import { TOKENS } from '../../tokens';
import { ConfigPort } from '../config/config.port';
import { Fetcher, FetcherPort } from '../fetcher';

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

  constructor(
    private readonly config: ConfigPort,
    private readonly fetcher: FetcherPort,
  ) {}

  async search(query: string): Promise<Array<[formatted: string, address: Address]>> {
    const { body } = await this.fetcher.get<QueryResult>(this.url(query));

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
