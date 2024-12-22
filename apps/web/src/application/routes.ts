export const routes = {
  home: '/',
  authentication: '/authentication',
  onboarding: '/onboarding',
  members: {
    list: '/members',
    details: (memberId: string) => `/members/${memberId}`,
  },
  requests: {
    list: '/requests',
    create: '/requests/create',
    details: (requestId: string) => `/requests/${requestId}`,
    edit: (requestId: string) => `/requests/${requestId}/edit`,
  },
  events: {
    list: '/events',
    create: `/events/create`,
    details: (eventId: string) => `/events/${eventId}`,
    edit: (eventId: string) => `/events/${eventId}/edit`,
  },
  interests: '/interests',
  misc: '/misc',
  profile: {
    edition: '/profile',
    address: '/profile/address',
    transactions: '/profile/transactions',
    notifications: '/profile/notifications',
    settings: '/profile/settings',
    signOut: '/profile/sign-out',
  },
  admin: {
    index: '/admin',
    memberList: '/admin/members',
  },
};
