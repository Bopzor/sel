import type { StorybookConfig } from 'storybook-solidjs-vite';

export default {
  stories: ['../src/**/*.stories.tsx'],
  framework: {
    name: 'storybook-solidjs-vite',
    options: {},
  },
} satisfies StorybookConfig;
