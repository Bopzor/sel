import type { Address } from '@sel/shared';
import z from 'zod';

export type AddressSuggestion = {
  id: string;
  address: Address;
};

export async function searchAddresses(text: string, signal?: AbortSignal): Promise<AddressSuggestion[]> {
  const url = new URL('/geocodage/search', 'https://data.geopf.fr');

  url.searchParams.set('q', text);
  url.searchParams.set('index', 'address');
  url.searchParams.set('autocomplete', '1');
  url.searchParams.set('limit', '5');

  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new Error(`Address search failed: HTTP ${String(response.status)}`);
  }

  const { success, data } = responseBodySchema.safeParse(await response.json());

  if (!success) {
    throw new Error(`Address search failed: unexpected response format`);
  }

  return data.features
    .filter(({ properties }) => properties.type !== 'municipality')
    .map(({ geometry, properties }) => ({
      id: properties.id,
      address: {
        line1: properties.name,
        postalCode: properties.postcode,
        city: properties.city,
        country: 'France',
        position: geometry.coordinates,
      },
    }));
}

const geocodingFeatureSchema = z.object({
  geometry: z.object({ coordinates: z.tuple([z.number(), z.number()]) }),
  properties: z.object({
    id: z.string(),
    type: z.union([
      z.literal('housenumber'),
      z.literal('street'),
      z.literal('locality'),
      z.literal('municipality'),
    ]),
    name: z.string(),
    postcode: z.string(),
    city: z.string(),
  }),
});

const responseBodySchema = z.object({
  features: z.array(geocodingFeatureSchema),
});
