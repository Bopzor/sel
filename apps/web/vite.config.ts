import path from 'node:path';
import { defineConfig } from 'vitest/config';
import solidPlugin from 'vite-plugin-solid';
import devtools from 'solid-devtools/vite';

export default defineConfig({
  plugins: [
    devtools({
      autoname: true,
      locator: true,
    }),
    solidPlugin(),
  ],
  server: {
    port: 8000,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  resolve: {
    alias: {
      '@sel/shared': path.resolve('../../packages/shared/src'),
      '@sel/utils': path.resolve('../../packages/utils/src'),
    },
  },
  build: {
    target: 'esnext',
  },
  test: {
    reporters: ['verbose'],
    environment: 'happy-dom',
    deps: {
      optimizer: {
        web: {
          enabled: true,
        },
      },
    },
  },
});
