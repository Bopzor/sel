import type { Config } from 'tailwindcss';
import colors from 'tailwindcss/colors';

const commonColors = {
  transparent: 'transparent',
  white: colors.white,
  black: colors.black,
  primary: '#005F7E',
  requests: colors.red[400],
  events: colors.yellow[400],
  members: colors.green[400],
  tools: colors.blue[400],
};

export default {
  content: ['src/**/*.tsx'],
  theme: {
    colors: {
      ...commonColors,
      neutral: colors.white,
      inverted: colors.black,
      green: colors.green[600],
      icon: colors.gray[600],
    },
    textColor: {
      ...commonColors,
      neutral: colors.neutral[900],
      dim: colors.gray[600],
    },
    borderColor: {
      ...commonColors,
      DEFAULT: colors.gray[200],
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
    },
  },
  plugins: [],
} satisfies Config;
