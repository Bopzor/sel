import { join } from 'node:path';

import tanstackQuery from '@tanstack/eslint-plugin-query';
import tailwind from 'eslint-plugin-better-tailwindcss';
import solid from 'eslint-plugin-solid/configs/recommended';
import { defineConfig } from 'oxlint';
import tsStylistic from 'oxlint-config-presets/@typescript-eslint/stylistic-type-checked.json' with { type: 'json' };

import base from '../../oxlint.config.ts';

export default defineConfig({
  plugins: ['react'],
  jsPlugins: ['eslint-plugin-solid', '@tanstack/eslint-plugin-query', 'eslint-plugin-better-tailwindcss'],
  extends: [base, tsStylistic],

  settings: {
    'better-tailwindcss': {
      entryPoint: join(import.meta.dirname, 'src/index.css'),
    },
  },

  rules: {
    ...solid.rules,
    ...tanstackQuery.configs.recommended.rules,
    ...tailwind.configs.correctness.rules,
    ...tailwind.configs.stylistic.rules,
    'typescript/array-type': 'off',
    'typescript/consistent-type-definitions': 'off',
    'typescript/prefer-nullish-coalescing': 'off',
    'typescript/prefer-regexp-exec': 'off',
    'typescript/non-nullable-type-assertion-style': 'off',
    'better-tailwindcss/enforce-consistent-line-wrapping': 'off',
  },
});
