import * as path from 'node:path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    watch: false,
    threads: false,
    setupFiles: './src/vitest.setup.ts',
    globalSetup: './src/vitest.global-setup.ts',
    environment: 'node',
    reporters: ['verbose'],
    alias: {
      '@sel/cqs': path.resolve('../../packages/cqs/src'),
      '@sel/shared': path.resolve('../../packages/shared/src'),
      '@sel/utils': path.resolve('../../packages/utils/src'),
    },
  },
});
