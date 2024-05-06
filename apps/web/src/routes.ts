export const routes = {
  home: '/',
  onboarding: '/onboarding',
  members: {
    list: '/members',
    member: (memberId: string) => `/members/${memberId}`,
  },
  requests: {
    list: '/requests',
    create: '/requests/create',
    request: (requestId: string) => `/requests/${requestId}`,
    edit: (requestId: string) => `/requests/${requestId}/edit`,
  },
  events: {
    list: '/events',
    create: `/events/create`,
    details: (eventId: string) => `/events/${eventId}`,
    edit: (eventId: string) => `/events/${eventId}/edit`,
  },
  interests: '/interests',
  assets: {
    home: '/assets',
  },
  misc: '/misc',
  profile: {
    profileEdition: '/profile',
    address: '/profile/address',
    notifications: '/profile/notifications',
    settings: '/profile/settings',
    signOut: '/profile/sign-out',
  },
};
