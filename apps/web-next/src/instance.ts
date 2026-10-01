import logo from '@sel/ui/assets/logo.svg';

type ColorRange = Record<50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950, string>;

// Until the instance's configuration is fetched from the server.
export const instance = {
  logo,
  name: 'SEL',
  place: 'Zone géographique',
  colors: {
    brand: {
      50: '#edf9ff',
      100: '#d7f2ff',
      200: '#b1e5ff',
      300: '#79d1f9',
      400: '#41b2e0',
      500: '#1093bf',
      600: '#08769b',
      700: '#056180',
      800: '#034c65',
      900: '#02384c',
      950: '#012330',
    },
    accent: {
      50: '#fdf6e5',
      100: '#fbecc5',
      200: '#f5da90',
      300: '#e4c05a',
      400: '#c89f01',
      500: '#a48200',
      600: '#846801',
      700: '#6c5501',
      800: '#564200',
      900: '#403100',
      950: '#281e00',
    },
  } satisfies Record<'brand' | 'accent', ColorRange>,
};

// Before the first render, to avoid a flash of the default colors.
export function applyInstanceColors() {
  const { style } = document.documentElement;

  for (const [name, range] of Object.entries(instance.colors)) {
    for (const [step, color] of Object.entries(range)) {
      style.setProperty(`--${name}-${step}`, color);
    }
  }
}
