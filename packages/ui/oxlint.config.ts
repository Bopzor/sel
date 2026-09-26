import { join } from 'node:path';

import { defineConfig } from 'oxlint';
import tsStylistic from 'oxlint-config-presets/@typescript-eslint/stylistic-type-checked.json' with { type: 'json' };

import base from '../../oxlint.config.ts';

export default defineConfig({
  plugins: ['react'],
  jsPlugins: ['oxlint-tailwindcss'],
  extends: [base, tsStylistic],

  settings: {
    tailwindcss: {
      entryPoint: join(import.meta.dirname, 'src/styles.css'),
    },
  },

  rules: {
    'typescript/array-type': 'off',
    'typescript/consistent-type-definitions': 'off',
    'typescript/prefer-nullish-coalescing': 'off',

    'tailwindcss/consistent-variant-order': 'error',
    'tailwindcss/enforce-canonical': 'error',
    'tailwindcss/enforce-shorthand': 'error',
    'tailwindcss/no-arbitrary-value': 'error',
    'tailwindcss/no-conflicting-classes': 'error',
    'tailwindcss/no-contradicting-variants': 'error',
    'tailwindcss/no-deprecated-classes': 'error',
    'tailwindcss/no-duplicate-classes': 'error',
    'tailwindcss/no-hardcoded-colors': 'error',
    'tailwindcss/no-restricted-classes': [
      'error',
      {
        patterns: [
          { pattern: '(^|:)dark:', message: 'Semantic tokens switch with the theme: use them instead of dark:.' },
        ],
      },
    ],
    'tailwindcss/no-unknown-classes': 'error',
    'tailwindcss/no-unnecessary-whitespace': 'error',
  },
});
