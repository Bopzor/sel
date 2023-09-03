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
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  build: {
    target: 'esnext',
  },
  test: {
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
