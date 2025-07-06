// @ts-check
import eslint from '@eslint/js';
import query from '@tanstack/eslint-plugin-query';
import solid from 'eslint-plugin-solid/configs/recommended';
import tseslint from 'typescript-eslint';

import tailwind from 'eslint-plugin-better-tailwindcss';

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  tseslint.configs.stylistic,
  solid,
  ...query.configs['flat/recommended'],
  {
    files: ['src/**/*'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'better-tailwindcss': tailwind,
    },
    settings: {
      'better-tailwindcss': {
        entryPoint: 'src/index.css',
      },
    },
    rules: {
      'no-console': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true }],
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/array-type': 'off',
      'solid/self-closing-comp': 'off',
      ...tailwind.configs['stylistic'].rules,
      ...tailwind.configs['correctness'].rules,
      'better-tailwindcss/enforce-consistent-line-wrapping': 'off',
    },
  },
);
