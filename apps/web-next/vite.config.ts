/// <reference types="vitest/config" />

import { lingui, linguiTransformerBabelPreset } from '@lingui/vite-plugin';
import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

import packageJson from './package.json' with { type: 'json' };

export default defineConfig({
  plugins: [
    react(),
    lingui({ failOnMissing: true }),
    babel({ presets: [reactCompilerPreset(), linguiTransformerBabelPreset()] }),
    tailwindcss(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      injectRegister: 'script-defer',
      injectManifest: { injectionPoint: undefined },
      pwaAssets: { image: 'public/logo.svg' },
      manifest: false,
      devOptions: { enabled: true, type: 'module' },
    }),
  ],
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
  },
  build: {
    sourcemap: true,
  },
  server: {
    port: 8000,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/manifest.webmanifest': {
        target: 'http://localhost:3000',
      },
    },
  },
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    watch: false,
    environment: 'happy-dom',
    // happy-dom's default page (about:blank) has no origin to resolve the app's relative URLs.
    environmentOptions: { happyDOM: { url: 'http://localhost:8000' } },
    setupFiles: ['src/tests/setup.ts'],
    fsModuleCache: true,
  },
});
