import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    watch: false,
    environment: 'node',
    setupFiles: './src/vitest.setup.ts',
    reporters: ['verbose'],
    fileParallelism: false,
  },
});
