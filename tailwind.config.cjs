const colors = require('tailwindcss/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['src/**/*.tsx'],
  plugins: [require('@tailwindcss/line-clamp'), require('@tailwindcss/typography')],

  theme: {
    screens: {
      md: '768px',
    },

    spacing: {
      0: 0,
      0.5: '0.5rem',
      1: '1rem',
      1.5: '1.5rem',
      2: '2rem',
      3: '3rem',
      4: '4rem',
    },
    maxWidth: {
      none: 'none',
      page: '85rem',
    },

    backgroundColor: {
      neutral: '#FFFFFF',
      inverted: '#000000',
      primary: '#005F7E',
      body: '#F0F0F0',
      requests: colors.red[400],
      events: colors.yellow[400],
      members: colors.green[400],
      tools: colors.blue[400],
      green: colors.green[600],
    },
    textColor: {
      inherit: 'inherit',
      neutral: '#121212',
      inverted: '#FFFFFF',
      white: '#FFFFFF',
      muted: '#121212BB',
      red: colors.red[500],
      green: colors.green[700],
      icon: colors.gray[600],
    },
    borderColor: {
      DEFAULT: colors.gray[200],
      primary: '#005F7E',
    },
    fill: {
      white: 'white',
      icon: colors.gray[600],
    },

    fontFamily: {
      inter: 'InterVariable',
    },
    fontSize: {
      xs: ['0.75rem', '1rem'],
      sm: ['0.875rem', '1.25rem'],
      base: ['var(--default-font-size)', '1.5rem'],
      lg: ['1.125rem', '1.75rem'],
      xl: ['1.5rem', '2rem'],
    },

    borderRadius: {
      xs: '0.25rem',
      DEFAULT: '0.5rem',
      lg: '1rem',
      full: '9999px',
    },
  },
};
