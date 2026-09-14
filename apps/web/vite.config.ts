import fs from 'node:fs/promises';
import path from 'node:path';

import tailwindcss from '@tailwindcss/vite';
import devtools from 'solid-devtools/vite';
import { Plugin } from 'vite';
import { qrcode } from 'vite-plugin-qrcode';
import solid from 'vite-plugin-solid';
import solidSvg from 'vite-plugin-solid-svg';
import { defineConfig } from 'vitest/config';

import pkg from './package.json' with { type: 'json' };

export default defineConfig({
  plugins: [qrcode(), devtools({ autoname: true }), solid(), solidSvg(), tailwindcss(), version(pkg.version)],
  server: {
    port: 8000,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '^/documents/.*': {
        target: 'http://localhost:3000',
      },
    },
  },
  build: {
    sourcemap: true,
  },
  optimizeDeps: {
    exclude: ['@modular-forms/solid'],
  },
  resolve: {
    tsconfigPaths: true,
    alias: {
      '@sel/shared': path.resolve('../../packages/shared/src'),
      '@sel/utils': path.resolve('../../packages/utils/src'),
    },
  },
  test: {
    environment: 'node',
  },
});

function version(version: string): Plugin {
  let dist = '';

  return {
    name: 'version',

    config(config) {
      config.define ??= {};
      config.define.__APP_VERSION__ = JSON.stringify(version);
    },

    configResolved(config) {
      dist = path.resolve(config.root, config.build.outDir);
    },

    async closeBundle() {
      await fs.writeFile(path.join(dist, 'version.txt'), version);
    },
  };
}
