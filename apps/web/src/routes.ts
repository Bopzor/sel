export const routes = {
  home: '/',
  onboarding: '/onboarding',
  members: {
    list: '/members',
    member: (memberId: string) => `/members/${memberId}`,
  },
  profile: {
    profileEdition: '/profile',
    address: '/profile/address',
    notifications: '/profile/notifications',
    signOut: '/profile/sign-out',
  },
};
