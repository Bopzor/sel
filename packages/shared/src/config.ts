export type Config = {
  maintenance: boolean;
  letsName: string;
  logoUrl: string;
  currency: string;
  currencyPlural: string;
  map: {
    center: [lng: number, lat: number];
    zoom: number;
  };
};
