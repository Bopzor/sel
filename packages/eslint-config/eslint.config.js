import globals from 'globals';

import baseConfig from './base.js';

export default [
  ...baseConfig,
  {
    files: ['base.js', 'typescript.js'],
    languageOptions: {
      globals: globals.node,
    },
  },
];
