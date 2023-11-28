import path from 'node:path';
import fs from 'node:fs/promises';

import { Plugin } from 'vite';
import { defineConfig } from 'vitest/config';
import { VitePWA } from 'vite-plugin-pwa';
import devtools from 'solid-devtools/vite';
import solidPlugin from 'vite-plugin-solid';
import solidSvg from 'vite-plugin-solid-svg';

export default defineConfig({
  plugins: [
    devtools({
      autoname: true,
      locator: true,
    }),
    solidPlugin(),
    solidSvg(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'script-defer',
      manifest: require('./manifest.json'),
    }),
    version(require('../../package.json').version),
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

function version(version: string): Plugin {
  let dist = '';

  return {
    name: 'version',
    configResolved(config) {
      dist = path.resolve(config.root, config.build.outDir);
    },
    async closeBundle() {
      await fs.writeFile(path.join(dist, 'version.txt'), version);
    },
  };
}
