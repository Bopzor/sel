import { join } from 'path';

import { defineConfig } from 'oxfmt';

import base from '../../oxfmt.config.ts';

export default defineConfig({
  ...base,
  sortTailwindcss: {
    stylesheet: join('src', 'index.css'),
    functions: ['clsx'],
  },
});
