import type { Config } from 'tailwindcss';
import colors from 'tailwindcss/colors';

export default {
  content: ['src/**/*.tsx'],
  theme: {
    colors: {
      transparent: colors.transparent,
      white: colors.white,
      black: colors.black,
      primary: '#005F7E',
      green: colors.emerald,
      blue: colors.blue,
      red: colors.red,
      yellow: colors.amber,
      gray: colors.gray,
      neutral: colors.white,
      inverted: colors.black,
      icon: colors.gray[600],
      text: colors.gray[800],
      dim: colors.gray[800],
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
      height: {
        map: '25rem',
      },
      aspectRatio: {
        '4/3': '4/3',
      },
    },
  },
  plugins: [],
} satisfies Config;
