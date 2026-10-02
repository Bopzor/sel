import type { LightMember } from '@sel/shared';

export function formatMemberName({ firstName, lastName }: Pick<LightMember, 'firstName' | 'lastName'>) {
  return [firstName, lastName].join(' ');
}

export function formatPhoneNumber(phoneNumber: string) {
  return phoneNumber.replace(/(\d{2})(?=\d)/g, '$1 ');
}
