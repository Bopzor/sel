import type { Config } from 'tailwindcss';
import colors from 'tailwindcss/colors';

export default {
  content: ['src/**/*.tsx'],
  theme: {
    colors: {
      neutral: '#FFFFFF',
      inverted: '#000000',
      primary: '#005F7E',
      body: '#F0F0F0',
      green: colors.green[600],
      icon: colors.gray[600],
    },
    borderColor: {
      primary: '#005F7E',
      DEFAULT: colors.gray[200],
    },
  },
  plugins: [],
} satisfies Config;
