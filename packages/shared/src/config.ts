import { createFactory } from '@sel/utils';

export type Config = {
  maintenance: boolean;
  letsName: string;
  place: string;
  currency: string;
  currencyPlural: string;
  logoUrl: string;
  theme: {
    primaryColor: string;
    accentColor: string;
    customCss?: string;
  };
  map: {
    center: [lng: number, lat: number];
    zoom: number;
  };
};

export const createConfig = createFactory<Config>(() => ({
  maintenance: false,
  letsName: '',
  place: '',
  currency: '',
  currencyPlural: '',
  logoUrl: '/logo',
  theme: {
    primaryColor: '',
    accentColor: '',
  },
  map: {
    center: [0, 0],
    zoom: 1,
  },
}));
