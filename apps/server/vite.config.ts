import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    watch: false,
    environment: 'node',
    setupFiles: './src/vitest.setup.ts',
    reporters: ['verbose'],
    fileParallelism: false,
  },
});
