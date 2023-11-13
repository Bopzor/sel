import { describe, expect, it } from 'vitest';

import { StubFetcher } from '../../fetcher';
import { StubConfigAdapter } from '../config/stub-config.adapter';

import { GeoapifyGeocodeAdapter } from './geocode-geoapify.adapter';

describe('GeocodeGeoapifyAdapter', () => {
  const result = {
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [5, 43],
        },
        properties: {
          country_code: 'fr',
          // cspell:disable-next-line
          housenumber: '123',
          street: 'rue de Paris',
          country: 'France',
          postcode: '84300',
          city: 'Cavaillon',
          lon: 5,
          lat: 43,
          formatted: '123 rue de Paris, 84300 Cavaillon, France',
          address_line1: '123 rue de Paris',
          address_line2: '84300 Cavaillon, France',
          department_COG: '84',
          result_type: 'building',
        },
      },
    ],
  };

  it('searches for an address', async () => {
    const config = new StubConfigAdapter({ geoapify: { apiKey: 'key' } });
    const fetcher = new StubFetcher();
    const adapter = new GeoapifyGeocodeAdapter(config, fetcher);

    fetcher.requests.set('https://api.geoapify.com/v1/geocode/search?text=query&apiKey=key', {
      body: result,
    });

    await expect(adapter.search('query')).resolves.toEqual([
      [
        '123 rue de Paris, 84300 Cavaillon, France',
        {
          city: 'Cavaillon',
          country: 'France',
          line1: '123 rue de Paris',
          position: [5, 43],
          postalCode: '84300',
        },
      ],
    ]);
  });
});
