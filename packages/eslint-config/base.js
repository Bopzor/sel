import js from '@eslint/js';
import pluginImport from 'eslint-plugin-import';
import globals from 'globals';

const ci = process.env.CI === 'true';

export default [
  js.configs.recommended,
  {
    ignores: ci ? [] : ['**/*'],
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
    },
  },
  {
    plugins: {
      import: pluginImport,
    },
    settings: {
      'import/resolver': {
        typescript: true,
      },
    },
    rules: {
      'import/no-named-as-default': 'off',
      'import/no-named-as-default-member': 'off',
      'import/order': [
        'warn',
        {
          'newlines-between': 'always',
          alphabetize: { order: 'asc' },
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          pathGroups: [
            {
              pattern: 'src/**',
              group: 'internal',
            },
          ],
        },
      ],
    },
  },
  {
    ignores: ci ? [] : ['**/*'],
    rules: {
      'no-console': 'error',
    },
  },
  {
    files: ['eslint.config.js'],
    languageOptions: {
      globals: globals.node,
    },
  },
];
