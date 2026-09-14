import { defineConfig } from 'oxfmt';

import base from '../../oxfmt.config.ts';

export default defineConfig({
  ...base,
  sortTailwindcss: {
    stylesheet: './src/index.css',
    functions: ['clsx'],
  },
});
