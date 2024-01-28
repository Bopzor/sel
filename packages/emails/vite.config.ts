import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [solid({ ssr: true }), dts()],
  ssr: {
    noExternal: ['solid-js'],
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    ssr: true,
    lib: {
      entry: 'src/index.ts',
      fileName: 'index',
      formats: ['es'],
    },
  },
});
