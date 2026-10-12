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
