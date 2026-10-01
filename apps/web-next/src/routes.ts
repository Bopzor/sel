import type { IconName } from '@sel/ui';

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
};

export const navigation = {
  main: {
    home: {
      path: routes.home(),
      label: 'Accueil',
      icon: 'home',
    },
  },

  exchanges: {
    requests: {
      path: routes.requests(),
      label: 'Demandes',
      icon: 'request',
    },
    events: {
      path: routes.events(),
      label: 'Événements',
      icon: 'event',
    },
  },

  community: {
    members: {
      path: routes.members(),
      label: 'Membres',
      icon: 'members',
    },
    interests: {
      path: routes.interests(),
      label: "Centres d'intérêts",
      icon: 'interests',
    },
    information: {
      path: routes.information(),
      label: 'Informations',
      icon: 'information',
    },
  },

  account: {
    profile: {
      path: routes.profile(),
      label: 'Profil',
      icon: 'profile',
    },
    settings: {
      path: routes.settings(),
      label: 'Paramètres',
      icon: 'settings',
    },
  },
} satisfies Record<string, Record<string, { path: string; label: string; icon: IconName }>>;
