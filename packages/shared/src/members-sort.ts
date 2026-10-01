import type { ValueOf } from '@sel/utils';

export const MembersSort = {
  firstName: 'firstName',
  lastName: 'lastName',
  membershipDate: 'membershipDate',
} as const;

export type MembersSort = ValueOf<typeof MembersSort>;
