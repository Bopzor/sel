import { withThemeByDataAttribute } from '@storybook/addon-themes';
import type { Preview } from '@storybook/react-vite';

import '../src/styles.css';

export default {
  parameters: {
    layout: 'padded',
    backgrounds: { disable: true },
    options: {
      storySort: {
        order: ['Introduction', 'Tokens', 'Contributing', 'Foundations', 'Guidelines', 'Components'],
      },
    },
  },
  decorators: [
    withThemeByDataAttribute({
      themes: { light: 'light', dark: 'dark' },
      defaultTheme: 'light',
      attributeName: 'data-theme',
    }),
  ],
} satisfies Preview;
