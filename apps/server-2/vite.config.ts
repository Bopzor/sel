import path from 'node:path';
import { defineConfig } from 'vitest/config';

const packages = path.resolve(__dirname, '..', '..', 'packages');

export default defineConfig({
  resolve: {
    alias: {
      '@sel/shared': path.join(packages, 'shared', 'src'),
      '@sel/utils': path.join(packages, 'utils', 'src'),
      src: 'src',
    },
  },
  test: {
    watch: false,
    environment: 'node',
    reporters: ['verbose'],
  },
});
