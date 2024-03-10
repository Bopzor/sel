import type { Config } from 'tailwindcss';
import colors from 'tailwindcss/colors';

export default {
  content: ['index.html', '.storybook/preview.tsx', 'src/**/*.tsx'],
  darkMode: 'class',
  theme: {
    colors: {
      primary: '#005F7E',
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
      icon: `rgb(var(--color-icon) / <alpha-value>)`,
    },
    fontFamily: {
      sans: ['Inter variable', 'sans-serif'],
    },
    lineHeight: {
      0: '0',
      1: '1em',
    },
    extend: {
      spacing: {
        em: '1em',
      },
      minHeight: {
        sm: '24rem',
        md: '32rem',
      },
      maxHeight: {
        md: '32rem',
      },
      aspectRatio: {
        '4/3': '4/3',
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
  plugins: [require('@tailwindcss/typography')],
} satisfies Config;
