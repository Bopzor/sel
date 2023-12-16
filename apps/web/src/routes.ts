export const routes = {
  home: '/',
  onboarding: '/onboarding',
  members: {
    list: '/members',
    member: (memberId: string) => `/members/${memberId}`,
  },
  requests: {
    list: '/requests',
    request: (requestId: string) => `/requests/${requestId}`,
  },
  events: {
    list: '/events',
  },
  activities: {
    home: '/activities',
  },
  assets: {
    home: '/assets',
  },
  misc: '/misc',
  profile: {
    profileEdition: '/profile',
    address: '/profile/address',
    notifications: '/profile/notifications',
    signOut: '/profile/sign-out',
  },
};
