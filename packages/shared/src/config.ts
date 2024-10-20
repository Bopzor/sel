export type Config = {
  letsName: string;
  logoUrl: string;
  currency: string;
  currencyPlural: string;
  map: {
    center: [lng: number, lat: number];
    zoom: number;
  };
};
