import typography from '@tailwindcss/typography';
import colors from 'tailwindcss/colors';
import { fontFamily } from 'tailwindcss/defaultTheme';

import { Config } from 'tailwindcss';

export default {
  content: ['src/**/*.tsx'],
  darkMode: 'class',
  theme: {
    colors: {
      inherit: colors.inherit,
      transparent: colors.transparent,
      white: colors.white,
      green: colors.emerald,
      blue: colors.blue,
      red: colors.red,
      yellow: colors.amber,
      gray: colors.gray,
      neutral: `rgb(var(--color-neutral) / <alpha-value>)`,
      inverted: `rgb(var(--color-inverted) / <alpha-value>)`,
      text: `rgb(var(--color-text) / <alpha-value>)`,
      dim: `rgb(var(--color-dim) / <alpha-value>)`,
      link: `rgb(var(--color-link) / <alpha-value>)`,
      primary: '#005F7E',
    },
    extend: {
      spacing: {
        em: '1em',
      },
      fontFamily: {
        sans: ['Inter Variable', ...fontFamily.sans],
      },
      lineHeight: {
        0: '0',
      },
      typography: {
        DEFAULT: {
          css: {
            color: `rgb(var(--color-text) / <alpha-value>)`,
          },
        },
      },
    },
  },
  plugins: [typography],
} satisfies Config;
