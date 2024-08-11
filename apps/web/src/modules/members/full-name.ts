import { Member } from '@sel/shared';

export function fullName(member: Pick<Member, 'firstName' | 'lastName'>) {
  return [member.firstName, member.lastName].join(' ');
}
