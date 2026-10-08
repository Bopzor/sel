import type { MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import type { IconName } from '@sel/ui';

export const routes = {
  home: () => '/',
  requests: () => '/requests',
  createRequest: () => '/requests/new',
  request: (requestId: string) => `/requests/${requestId}`,
  editRequest: (requestId: string) => `/requests/${requestId}/edit`,
  events: () => '/events',
  createEvent: () => '/events/new',
  event: (eventId: string) => `/events/${eventId}`,
  editEvent: (eventId: string) => `/events/${eventId}/edit`,
  information: () => '/information',
  createInformation: () => '/information/new',
  informationDetails: (informationId: string) => `/information/${informationId}`,
  editInformation: (informationId: string) => `/information/${informationId}/edit`,
  documents: () => '/documents',
  members: () => '/members',
  membersMap: (memberId?: string) =>
    '/members/map' + (memberId ? '?' + new URLSearchParams({ memberId }).toString() : ''),
  member: (memberId: string, tab?: 'exchanges' | 'activity') =>
    `/members/${memberId}` + (tab ? `/${tab}` : ''),
  interests: () => '/interests',
  profile: () => '/profile',
  settings: () => '/settings',
  navigation: () => '/navigation',
  authentication: (next?: string) =>
    '/authentication' + (next === undefined ? '' : '?' + new URLSearchParams({ next }).toString()),
};

export type NavigationItem = { path: string; label: MessageDescriptor; icon: IconName };

export const navigation = {
  main: {
    home: {
      path: routes.home(),
      label: msg`Home`,
      icon: 'home',
    },
  },

  exchanges: {
    requests: {
      path: routes.requests(),
      label: msg`Requests`,
      icon: 'request',
    },
    events: {
      path: routes.events(),
      label: msg`Events`,
      icon: 'event',
    },
  },

  community: {
    members: {
      path: routes.members(),
      label: msg`Members`,
      icon: 'members',
    },
    interests: {
      path: routes.interests(),
      label: msg`Interests`,
      icon: 'interests',
    },
    information: {
      path: routes.information(),
      label: msg`Information`,
      icon: 'information',
    },
    documents: {
      path: routes.documents(),
      label: msg`Documents`,
      icon: 'document',
    },
  },

  account: {
    profile: {
      path: routes.profile(),
      label: msg`Profile`,
      icon: 'profile',
    },
    settings: {
      path: routes.settings(),
      label: msg`Settings`,
      icon: 'settings',
    },
  },
} satisfies Record<string, Record<string, NavigationItem>>;
