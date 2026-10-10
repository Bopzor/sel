import { defineConfig } from 'oxfmt';

import base from '../../oxfmt.config.ts';

export default defineConfig({
  ...base,
  sortTailwindcss: {
    stylesheet: './src/styles.css',
    functions: ['clsx', 'cva'],
  },
});
