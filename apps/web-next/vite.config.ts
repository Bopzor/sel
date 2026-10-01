/// <reference types="vitest/config" />

import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), babel({ presets: [reactCompilerPreset()] }), tailwindcss()],
  server: {
    port: 8000,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  test: {
    watch: false,
    environment: 'happy-dom',
    // happy-dom's default page (about:blank) has no origin to resolve the app's relative URLs.
    environmentOptions: { happyDOM: { url: 'http://localhost:8000' } },
    setupFiles: ['src/test-setup.ts'],
  },
});
