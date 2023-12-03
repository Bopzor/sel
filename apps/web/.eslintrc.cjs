module.exports = {
  extends: [
    '@sel/eslint-config/base-eslint.config.cjs',
    'plugin:solid/typescript',
    'plugin:tailwindcss/recommended',
    'plugin:storybook/recommended',
  ],

  plugins: ['solid'],

  parserOptions: {
    project: ['./tsconfig.json'],
    tsconfigRootDir: __dirname,
    ecmaFeatures: {
      jsx: true,
    },
  },

  settings: {
    tailwindcss: {
      config: 'tailwind.config.ts',
      classRegex: '^class(List)?$',
    },
  },

  rules: {
    'tailwindcss/no-arbitrary-value': 'warn',
  },

  overrides: [
    {
      files: ['vite.config.ts'],
      parserOptions: {
        project: ['./tsconfig.node.json'],
        tsconfigRootDir: __dirname,
      },
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
  ],
};
