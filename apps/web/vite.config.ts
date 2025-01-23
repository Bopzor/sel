import fs from 'node:fs/promises';
import path from 'node:path';
import { defineConfig, Plugin } from 'vite';
import { qrcode } from 'vite-plugin-qrcode';
import solid from 'vite-plugin-solid';
import solidSvg from 'vite-plugin-solid-svg';
import tsconfigPaths from 'vite-tsconfig-paths';

import pkg from './package.json';

export default defineConfig({
  plugins: [qrcode(), tsconfigPaths(), solid(), solidSvg(), version(() => pkg.version)],
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
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          maplibre: ['maplibre-gl'],
          tiptap: [
            '@tiptap/core',
            '@tiptap/extension-image',
            '@tiptap/extension-link',
            '@tiptap/extension-placeholder',
            '@tiptap/extension-underline',
            '@tiptap/starter-kit',
          ],
        },
      },
    },
  },
  optimizeDeps: {
    exclude: ['@modular-forms/solid'],
  },
  resolve: {
    alias: {
      '@sel/shared': path.resolve('../../packages/shared/src'),
      '@sel/utils': path.resolve('../../packages/utils/src'),
    },
  },
});

function version(getVersion: () => string | Promise<string>): Plugin {
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
