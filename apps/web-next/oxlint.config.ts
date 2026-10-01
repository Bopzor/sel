import { join } from 'node:path';

import tanstackQuery from '@tanstack/eslint-plugin-query';
import tailwind from 'eslint-plugin-better-tailwindcss';
import { defineConfig } from 'oxlint';
import tsStylistic from 'oxlint-config-presets/@typescript-eslint/stylistic-type-checked.json' with { type: 'json' };
import react from 'oxlint-config-presets/react/recommended.json' with { type: 'json' };

import base from '../../oxlint.config.ts';

export default defineConfig({
  jsPlugins: ['@tanstack/eslint-plugin-query', 'eslint-plugin-better-tailwindcss'],
  extends: [base, tsStylistic, react],

  settings: {
    'better-tailwindcss': {
      entryPoint: join(import.meta.dirname, 'src', 'index.css'),
    },
  },

  rules: {
    'typescript/array-type': 'off',
    'typescript/consistent-type-definitions': 'off',
    'react/react-in-jsx-scope': 'off',
    ...tanstackQuery.configs.recommended.rules,
    ...tailwind.configs.correctness.rules,
    ...tailwind.configs.stylistic.rules,
    'better-tailwindcss/enforce-consistent-line-wrapping': 'off',
  },
});
