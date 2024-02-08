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
import { FakeMemberApi } from '../src/modules/members/members.api';

export default {
  parameters: {
    // remove padding on body
    layout: 'fullscreen',
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
      <div class="max-w-7xl min-h-screen col p-6">
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
      container.bindValue(TOKENS.memberApi, new FakeMemberApi());
      container.bindValue(TOKENS.requestApi, new FakeRequestsApi());

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
