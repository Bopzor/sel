import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    watch: false,
    environment: 'node',
    reporters: ['verbose'],
    fileParallelism: false,
  },
});