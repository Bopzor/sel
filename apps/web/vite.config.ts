import { exec } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';

import devtools from 'solid-devtools/vite';
import { Plugin } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { qrcode } from 'vite-plugin-qrcode';
import solidPlugin from 'vite-plugin-solid';
import solidSvg from 'vite-plugin-solid-svg';
import { defineConfig } from 'vitest/config';

// cspell:word qrcode

const getVersion = () => {
  return new Promise<string>((resolve) => {
    exec('git rev-parse HEAD', (error, stdout) => resolve(stdout));
  });
};

export default defineConfig({
  plugins: [
    devtools({
      autoname: true,
      locator: true,
    }),
    qrcode(),
    solidPlugin(),
    solidSvg(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: require('./manifest.json'),
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'service-worker.ts',
      devOptions: {
        enabled: false,
        type: 'module',
      },
    }),
    version(getVersion),
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
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: {
          'maplibre-gl': ['maplibre-gl'],
        },
      },
    },
  },
  test: {
    reporters: ['verbose'],
    environment: 'happy-dom',
    watch: false,
    deps: {
      optimizer: {
        web: {
          enabled: true,
        },
      },
    },
  },
});

function version(getVersion: () => Promise<string>): Plugin {
  let dist = '';

  return {
    name: 'version',
    configResolved(config) {
      dist = path.resolve(config.root, config.build.outDir);
    },
    async closeBundle() {
      await fs.writeFile(path.join(dist, 'version.txt'), await getVersion());
    },
  };
}
