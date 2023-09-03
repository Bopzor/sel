module.exports = {
  extends: [
    '@sel/eslint-config/base-eslint.config.cjs',
    'plugin:solid/typescript',
    'plugin:tailwindcss/recommended',
  ],

  plugins: ['solid'],

  parserOptions: {
    project: ['./tsconfig.json'],
    tsconfigRootDir: __dirname,
    ecmaFeatures: {
      jsx: true,
    },
  },
};
