import { Preview } from 'storybook-solidjs-vite';

// @ts-expect-error font import
import '@fontsource-variable/inter';
import '../src/index.css';

import { IntlProvider } from '../src/intl/intl-provider';

export default {
  decorators: (Story) => (
    <IntlProvider>
      <Story />
    </IntlProvider>
  ),
} satisfies Preview;
