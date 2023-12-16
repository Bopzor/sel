import { Preview } from 'storybook-solidjs';
import { IntlProvider } from '../src/intl/intl-provider';

import '../src/index.css';

export default {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story) => (
      <IntlProvider>
        <Story />
      </IntlProvider>
    ),
  ],
} satisfies Preview;
