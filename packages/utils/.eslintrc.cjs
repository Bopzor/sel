module.exports = {
  extends: ['@sel/eslint-config/base-eslint.config.cjs'],

  parserOptions: {
    project: ['./tsconfig.json'],
    tsconfigRootDir: __dirname,
  },
};
