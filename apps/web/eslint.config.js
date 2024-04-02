import { FlatCompat } from '@eslint/eslintrc';
import url from 'node:url';
import path from 'node:path';

import solid from 'eslint-plugin-solid/dist/configs/typescript.js';
import base from '@sel/eslint-config/base.js';
import typescript from '@sel/eslint-config/typescript.js';
import globals from 'globals';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({ resolvePluginsRelativeTo: __dirname });

export default [
  ...base,
  ...typescript,
  ...compat.extends('plugin:tailwindcss/recommended'),
  solid,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      'tailwindcss/no-arbitrary-value': 'warn',
      'storybook/prefer-pascal-case': 'off',
      'solid/self-closing-comp': 'off',
    },
  },
  {
    files: ['vite.config.ts'],
    languageOptions: {
      parserOptions: {
        project: 'tsconfig.node.json',
      },
    },
    rules: {
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-var-requires': 'off',
    },
  },
];
