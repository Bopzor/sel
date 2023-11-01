import * as path from 'node:path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    watch: false,
    singleThread: true,
    globalSetup: './src/vitest.setup.ts',
    reporters: ['verbose'],
    alias: {
      '@sel/shared': path.resolve('../../packages/shared/src'),
      '@sel/utils': path.resolve('../../packages/utils/src'),
    },
  },
});
