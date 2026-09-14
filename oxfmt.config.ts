import { defineConfig } from 'oxfmt';

export default defineConfig({
  printWidth: 110,
  singleQuote: true,
  sortPackageJson: false,
  ignorePatterns: ['apps/server/drizzle'],
  sortImports: {
    internalPattern: ['src/'],
    groups: [
      ['builtin'],
      ['external'],
      'internal',
      ['value-parent'],
      ['value-sibling', 'value-index'],
      'unknown',
    ],
  },
});
