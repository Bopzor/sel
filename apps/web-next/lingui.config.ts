import { defineConfig } from '@lingui/conf';
import { formatter } from '@lingui/format-po';

export default defineConfig({
  sourceLocale: 'en',
  locales: ['en', 'fr'],
  catalogs: [{ path: '<rootDir>/src/locales/{locale}', include: ['src'] }],
  format: formatter({ lineNumbers: false }),
});
