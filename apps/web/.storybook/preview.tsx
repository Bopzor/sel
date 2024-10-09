import { MemoryRouter, Navigate, Route } from '@solidjs/router';
import { Preview } from 'storybook-solidjs';
import { AppContextProvider } from '../src/app-context';
import { container } from '../src/infrastructure/container';
import { StubMemberAvatarAdapter } from '../src/infrastructure/member-avatar/stub-member-avatar.adapter';
import { IntlProvider } from '../src/intl/intl-provider';
import { TOKENS } from '../src/tokens';
import { FakeMemberApi, FakeRequestsApi, FakeSessionApi } from './fake-api';

import '@fontsource-variable/inter';
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
      <AppContextProvider>
        <Story />
      </AppContextProvider>
    ),

    (Story) => {
      container.bindValue(TOKENS.memberAvatar, new StubMemberAvatarAdapter());
      container.bindValue(TOKENS.sessionApi, new FakeSessionApi());
      container.bindValue(TOKENS.memberApi, new FakeMemberApi());
      container.bindValue(TOKENS.requestApi, new FakeRequestsApi());

      return <Story />;
    },

    (Story, { parameters }) => {
      const { path = '/', location = '/' } = parameters.router ?? {};

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
