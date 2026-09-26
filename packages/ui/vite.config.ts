import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Used by Storybook: the package itself is consumed from its sources.
export default defineConfig({
  plugins: [react(), tailwindcss()],
});
