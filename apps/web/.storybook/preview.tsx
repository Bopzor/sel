import { Preview } from 'storybook-solidjs';
import { MemoryRouter, Navigate, Route } from '@solidjs/router';
import { AppContextProvider } from '../src/app-context';
import { container } from '../src/infrastructure/container';
import { IntlProvider } from '../src/intl/intl-provider';
import { FakeRequestsApi } from '../src/modules/requests/requests.api';
import { TOKENS } from '../src/tokens';

import '@fontsource-variable/inter';
import '../src/index.css';
import { FakeSessionApi } from '../src/session.api';
import { StubMemberAvatarAdapter } from '../src/infrastructure/member-avatar/stub-member-avatar.adapter';

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
      <div class="max-w-7xl">
        <Story />
      </div>
    ),

    (Story) => (
      <AppContextProvider>
        <Story />
      </AppContextProvider>
    ),

    (Story) => {
      container.bindValue(TOKENS.memberAvatar, new StubMemberAvatarAdapter());
      container.bindValue(TOKENS.sessionApi, new FakeSessionApi());
      container.bindValue(TOKENS.requestsApi, new FakeRequestsApi());

      return <Story />;
    },

    (Story, { parameters }) => {
      if (!parameters.router) {
        return <Story />;
      }

      const { path = '/', location = '/' } = parameters.router;

      return (
        <MemoryRouter>
          <Route path={path} component={Story} />
          <Route component={() => <Navigate href={location} />} />
        </MemoryRouter>
      );
    },

    (Story) => (
      <IntlProvider>
        <Story />
      </IntlProvider>
    ),
  ],
} satisfies Preview;
