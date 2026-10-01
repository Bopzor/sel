import type { IconName } from '@sel/ui';

import { t } from './translations';

export const routes = {
  home: () => '/',
  requests: () => '/requests',
  events: () => '/events',
  information: () => '/information',
  members: () => '/members',
  interests: () => '/interests',
  profile: () => '/profile',
  settings: () => '/settings',
  navigation: () => '/navigation',
  authentication: (next?: string) =>
    '/authentication' + (next === undefined ? '' : '?' + new URLSearchParams({ next }).toString()),
};

export const navigation = {
  main: {
    home: {
      path: routes.home(),
      label: t.navigation.items.home,
      icon: 'home',
    },
  },

  exchanges: {
    requests: {
      path: routes.requests(),
      label: t.navigation.items.requests,
      icon: 'request',
    },
    events: {
      path: routes.events(),
      label: t.navigation.items.events,
      icon: 'event',
    },
  },

  community: {
    members: {
      path: routes.members(),
      label: t.navigation.items.members,
      icon: 'members',
    },
    interests: {
      path: routes.interests(),
      label: t.navigation.items.interests,
      icon: 'interests',
    },
    information: {
      path: routes.information(),
      label: t.navigation.items.information,
      icon: 'information',
    },
  },

  account: {
    profile: {
      path: routes.profile(),
      label: t.navigation.items.profile,
      icon: 'profile',
    },
    settings: {
      path: routes.settings(),
      label: t.navigation.items.settings,
      icon: 'settings',
    },
  },
} satisfies Record<string, Record<string, { path: string; label: string; icon: IconName }>>;
