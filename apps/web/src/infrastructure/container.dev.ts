import { Container } from 'ditox';

import { TOKENS } from '../tokens';

import { StubGeocodeAdapter } from './geocode/stub-geocode.adapter';

export function configureDevEnv(container: Container) {
  const geocode = new StubGeocodeAdapter();

  container.bindValue(TOKENS.geocode, geocode);

  geocode.addresses.set('61 Impasse-des-grenadiers, 84300 Cavaillon, France', {
    line1: '61 Impasse-des-grenadiers',
    city: 'Cavaillon',
    postalCode: '84300',
    country: 'France',
    position: [5.037463, 43.82622],
  });

  geocode.addresses.set('61 Impasse Des Grenadiers, 83136 Forcalqueiret, France', {
    line1: '61 Impasse Des Grenadiers',
    city: 'Forcalqueiret',
    postalCode: '83136',
    country: 'France',
    position: [6.091428, 43.332007],
  });

  geocode.addresses.set('61 Impasse Des Grenadiers, 97233 MQ, France', {
    line1: '61 Impasse Des Grenadiers',
    city: 'MQ',
    postalCode: '97233',
    country: 'France',
    position: [-61.098011, 14.627564],
  });
}
