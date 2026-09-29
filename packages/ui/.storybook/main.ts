import { resolve } from 'node:path';

import type { StorybookConfig } from '@storybook/react-vite';
import remarkGfm from 'remark-gfm';

export default {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.tsx'],
  addons: [
    {
      name: '@storybook/addon-docs',
      options: {
        mdxPluginOptions: {
          mdxCompileOptions: {
            remarkPlugins: [remarkGfm],
          },
        },
      },
    },
    '@storybook/addon-themes',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  typescript: {
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      // tsconfig.json only references the projects: the components are in tsconfig.app.json.
      tsconfigPath: resolve(import.meta.dirname, '../tsconfig.app.json'),
      propFilter: (prop) =>
        !prop.parent?.fileName.includes('node_modules') && !['never', 'undefined'].includes(prop.type.name),
      shouldExtractLiteralValuesFromEnum: true,
      shouldRemoveUndefinedFromOptional: true,
    },
  },
} satisfies StorybookConfig;
